const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  console.log('Generating test PDF files...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // 1. Valid PDF Resume
  const validResumeHtml = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { margin-bottom: 5px; }
          .contact { font-size: 0.9em; color: #555; margin-bottom: 20px; }
          h2 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <h1>Vamsi Krishna Tadisetti</h1>
        <div class="contact">
          Email: vamsi2005510@gmail.com | Phone: +1 123-456-7890 | GitHub: github.com/vamsi
        </div>
        
        <h2>Professional Summary</h2>
        <p>Experienced Software Engineer with a strong background in developing robust full-stack applications. Proven track record of improving performance and user engagement.</p>
        
        <h2>Work Experience</h2>
        <ul>
          <li>
            <strong>Software Engineer | Google</strong> (2022 - Present)
            <br>Led development of core features. Mentored junior engineers.
          </li>
          <li>
            <strong>Associate Engineer | Microsoft</strong> (2020 - 2022)
            <br>Developed cloud services. Managed CI/CD pipelines.
          </li>
        </ul>
        
        <h2>Education</h2>
        <ul>
          <li>
            <strong>Bachelor of Technology in Computer Science</strong>
            <br>IIT Madras, 2016 - 2020
          </li>
        </ul>
        
        <h2>Skills</h2>
        <ul>
          <li>Languages: JavaScript, TypeScript, Python, Java, C++</li>
          <li>Frameworks: React, Next.js, Node.js, Express</li>
        </ul>
      </body>
    </html>
  `;
  await page.setContent(validResumeHtml);
  await page.pdf({ path: path.join(__dirname, 'valid_resume.pdf'), format: 'A4' });
  console.log('Saved valid_resume.pdf');

  // 2. Random PDF (non-resume content, e.g., a simple essay or article)
  const randomPdfHtml = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.6; }
          h1 { text-align: center; }
        </style>
      </head>
      <body>
        <h1>The Beauty of Nature</h1>
        <p>Nature is a source of joy and inspiration for human beings. It consists of the physical world around us, including plants, animals, landscapes, and all other features and products of the earth.</p>
        <p>Spending time in nature can help reduce stress and anxiety, improve mood, and boost overall physical health. Walking in parks, hiking in mountains, or sitting by a river can bring deep peace and relaxation.</p>
        <p>It is important that we protect our environment. Climate change and deforestation threaten many species and ecosystems. We must all work together to practice sustainability and preserve the planet for future generations.</p>
      </body>
    </html>
  `;
  await page.setContent(randomPdfHtml);
  await page.pdf({ path: path.join(__dirname, 'random_resume.pdf'), format: 'A4' });
  console.log('Saved random_resume.pdf (non-resume document)');

  await browser.close();

  // 3. Corrupted PDF (invalid PDF bytes)
  fs.writeFileSync(path.join(__dirname, 'corrupted_resume.pdf'), 'This is not a PDF file. Just random text to simulate corruption.');
  console.log('Saved corrupted_resume.pdf');
}

run().catch(console.error);
