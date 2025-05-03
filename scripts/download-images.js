const https = require('https');
const fs = require('fs');
const path = require('path');

// Create the images directory if it doesn't exist
const imagesDir = path.join(__dirname, '../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Function to download an image
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(imagesDir, filename);
    
    // Skip if file already exists
    if (fs.existsSync(filePath)) {
      console.log(`File already exists: ${filename}`);
      resolve();
      return;
    }
    
    console.log(`Downloading: ${filename} from ${url}`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
      
      fileStream.on('error', (err) => {
        fs.unlink(filePath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Unsplash high-quality fashion images
const images = [
  // Original images
  {
    url: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?q=80&w=2000&auto=format&fit=crop',
    filename: 'hero-sustainable-fashion.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=2000&auto=format&fit=crop',
    filename: 'hero-closet-sharing.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2000&auto=format&fit=crop',
    filename: 'hero-community-fashion.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1561052967-61fc91e48d79?q=80&w=2000&auto=format&fit=crop',
    filename: 'hero-upcycled-fashion.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
    filename: 'outfit-vintage-denim.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
    filename: 'outfit-eco-essentials.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2000&auto=format&fit=crop',
    filename: 'outfit-upcycled-chic.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop',
    filename: 'outfit-sustainable-luxury.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1479936343636-73cdc5aae0c3?q=80&w=2000&auto=format&fit=crop',
    filename: 'outfit-minimalist.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?q=80&w=2000&auto=format&fit=crop',
    filename: 'manifesto-sustainable.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=2000&auto=format&fit=crop',
    filename: 'manifesto-community.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?q=80&w=2000&auto=format&fit=crop',
    filename: 'manifesto-accessible.jpg'
  },
  
  // Additional fashion images for unique visuals
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-trendy-style.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551803091-e20673f15770?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-urban-street.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1550614000-4895a10e1bfd?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-colorful-chic.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-summer-outfit.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-ethical-clothing.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-spring-collection.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-casual-elegant.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1441123100240-f9f3f8714399?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-timeless-beauty.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1485125639709-a60c3a500bf1?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-bohemian-style.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-social-sharing.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1506634572416-48cdfe530110?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-contemporary-look.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-modern-wardrobe.jpg'
  },
  // Additional images for unique section visuals
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-bold-color.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-elegant-style.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-artisan-made.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-sustainable-clothing.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=2000&auto=format&fit=crop',
    filename: 'fashion-premium-quality.jpg'
  },
  
  // New images for Tinder-style swipe closet
  {
    url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-1.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-2.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-3.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1562572159-4efc207f5aff?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-4.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-5.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-6.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1622519407650-3df9883f76a5?q=80&w=2000&auto=format&fit=crop',
    filename: 'tinder-fashion-7.jpg'
  }
];

// Download all images sequentially
async function downloadAllImages() {
  for (const image of images) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`Failed to download ${image.filename}:`, error.message);
    }
  }
  console.log('All images downloaded successfully!');
}

downloadAllImages(); 