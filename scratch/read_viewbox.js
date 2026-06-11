import fetch from 'node-fetch';

async function main() {
  const url = 'https://res.cloudinary.com/dph28qrrx/image/upload/v1780765409/CampusMap_nzo2ip.svg';
  try {
    const res = await fetch(url);
    const text = await res.text();
    const match = text.match(/viewBox=["']([^"']+)["']/);
    console.log('viewBox:', match ? match[1] : 'not found');
    console.log('First 500 chars:', text.substring(0, 500));
  } catch (err) {
    console.error(err);
  }
}

main();
