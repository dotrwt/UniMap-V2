// scratch/query_db.js
import http from 'http';

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    const buildings = await getJson('http://localhost:3000/api/buildings');
    console.log('BUILDINGS:', JSON.stringify(buildings.data?.slice(0, 3), null, 2));

    const floors = await getJson('http://localhost:3000/api/floors');
    console.log('FLOORS:', JSON.stringify(floors.data?.slice(0, 3), null, 2));

    const nodes = await getJson('http://localhost:3000/api/nodes');
    console.log('NODES COUNT:', nodes.data?.length);
    console.log('SAMPLE NODE:', JSON.stringify(nodes.data?.[0], null, 2));
    const uniqueMaps = new Set(nodes.data?.map(n => n.map));
    console.log('UNIQUE NODE MAPS:', Array.from(uniqueMaps));
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
