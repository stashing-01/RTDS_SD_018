// === Backend (Node/Express) with Axios and Caching ===
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

function getModelConstraints(modelType) {
  const constraints = {
    nlp: { minRam: 64, minVram: 40, preferredGpus: ['a100', 'l40'], multiGpu: true },
    image: { minRam: 8, maxRam: 24, minVram: 8, preferredGpus: ['rtx', 'v100', 'a10'], multiGpu: false },
    gan: { minRam: 32, minVram: 40, preferredGpus: ['a100', 'l40'], multiGpu: true },
    tabular: { minRam: 8, noGpu: true },
    rl: { minRam: 32, minVram: 8, preferredGpus: ['rtx'], multiGpu: false },
    inference: { minVram: 8, preferredGpus: ['t4', 'a10', 'rtx'], useSpot: true },
    fine_tune: { minRam: 16, minVram: 12, preferredGpus: ['a30', 't4'] }
  };
  return constraints[modelType] || {};
}

function parseVram(description) {
  if (typeof description !== 'string') return 0;
  const match = description.match(/(\d+)(?:GB)?/);
  return match ? parseInt(match[1]) : 0;
}


// function matchGpu(gpu, user, constraints) {
//   //console.log(gpu.region)
//   //console.log(user.region)
//   if (user.region && gpu.region !== user.region) return false;
//   if (constraints.noGpu && !gpu.is_gpu) return true;
//   if (!gpu.is_gpu) return false;

//   const vram = parseVram(gpu.gpu_description);
//   //console.log(vram)
//   const gpuType = gpu.gpu_description.toLowerCase();
//   //console.log(gpuType)
//   const hasMultiGpu = gpu.gpu_description.includes('2x') || gpu.gpu_description.includes('4x');

//   console.log(
//     (!constraints.minRam || gpu.ram >= constraints.minRam),
//     (!constraints.maxRam || gpu.ram <= constraints.maxRam),
//     (!constraints.minVram || vram >= constraints.minVram),
//     (!user.multiGPU || hasMultiGpu) ,
//     (!constraints.preferredGpus || constraints.preferredGpus.some(g => gpuType.includes(g))) ,
//     (gpu.price_per_hour * 1000 <= user.budget)
//   )

//   console.log();

//   return (
//     (!constraints.minRam || gpu.ram >= constraints.minRam) &&
//     (!constraints.maxRam || gpu.ram <= constraints.maxRam) &&
//     (!constraints.minVram || vram >= constraints.minVram) &&
//     (!user.multiGPU || hasMultiGpu) &&
//     (!constraints.preferredGpus || constraints.preferredGpus.some(g => gpuType.includes(g))) &&
//     (gpu.price_per_hour * 1000 <= user.budget)
//   );
// }

function scoreGpu(gpu, user, constraints) {
  let score = 0;

  // Region match (important)
  if (!user.region || gpu.region === user.region) score += 2;

  // GPU type (skip non-GPUs unless user wants tabular)
  if (constraints.noGpu && !gpu.is_gpu) score += 2;
  else if (gpu.is_gpu) score += 1;
  else return 0; // skip non-GPU instances otherwise

  const vram = parseVram(gpu.gpu_description);
  const gpuType = (gpu.gpu_description || '').toLowerCase();

  const hasMultiGpu = gpu.gpu_description?.includes('2x') || gpu.gpu_description?.includes('4x');


  // Constraint scores
  if (!constraints.minRam || gpu.ram >= constraints.minRam) score += 1;
  if (!constraints.maxRam || gpu.ram <= constraints.maxRam) score += 1;
  if (!constraints.minVram || vram >= constraints.minVram) score += 1;
  if (!constraints.preferredGpus || constraints.preferredGpus.some(g => gpuType.includes(g))) score += 1;
  if (!user.multiGPU || hasMultiGpu) score += 1;
  if (!user.budget || gpu.price_per_hour * 1000 <= user.budget) score += 2;

  console.log("score : ",score)

  return score;
}

let cachedGpuData = null;
let cacheTimestamp = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

app.post('/api/recommend', async (req, res) => {
  const user = req.body;
  const constraints = getModelConstraints(user.modelType);
  const now = Date.now();

  try {
    let gpuData;

    if (cachedGpuData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
      gpuData = cachedGpuData;
    } else {
      const response = await axios.get('https://dev-portal.openstack.acecloudhosting.com/api/v1/pricing?is_gpu=true&resource=instances&region=ap-south-mum-1');

      if (!Array.isArray(response.data.data)) {
        throw new Error('Invalid GPU data format');
      }

      gpuData = response.data.data;
      //console.log(gpuData);
      cachedGpuData = gpuData;
      cacheTimestamp = now;
    }

    // const topGpuData = gpuData.slice(0, 20); // avoid overload
    console.log(gpuData);
    // const recommendations = gpuData
    //   .filter(gpu => matchGpu(gpu, user, constraints))
    //   .slice(0, 5);


    // console.log(recommendations);
    // res.json(recommendations);

    // Score and rank GPUs based on how many constraints they satisfy
    const scored = gpuData
    .map(gpu => ({ gpu, score: scoreGpu(gpu, user, constraints) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(entry => entry.gpu);

    console.log(scored);
    res.json(scored);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error('Rate limited (429): Too many requests');
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    console.error('Error fetching GPU data:', error.message);
    res.status(500).json({ error: 'Failed to fetch GPU data' });
  }
});

// ✅ Make message match actual port
app.listen(5000, () => console.log('Server running on port 5000'));
