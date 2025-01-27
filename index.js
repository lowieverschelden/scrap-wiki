const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';

app.get('/', async (req, res) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // Verzamel alle links binnen de ID #mw-pages
    const links = [];
    $('#mw-pages a').each((index, element) => {
      const relativeLink = $(element).attr('href');
      const fullLink = `https://es.wikipedia.org${relativeLink}`;
      links.push(fullLink);
    });

    const results = [];

    // Loop door elke link en scrape gegevens
    for (const link of links) {
      const pageData = await axios.get(link);
      const $$ = cheerio.load(pageData.data);

      const title = $$('h1').text();
      const images = [];
      $$('img').each((index, element) => {
        images.push($$(element).attr('src'));
      });

      const texts = [];
      $$('p').each((index, element) => {
        texts.push($$(element).text());
      });

      results.push({ title, images, texts });
    }

    res.send(results); // Toon gescrapete gegevens in de browser
  } catch (error) {
    console.error('Error tijdens het scrapen:', error);
    res.status(500).send('Er ging iets mis!');
  }
});

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}`);
});
