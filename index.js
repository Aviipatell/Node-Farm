const fs = require("fs"); // fs stands for File System
const http = require("http"); // gives us networking capabilities
const url = require("url");
const replaceTemplate = require("./modules/replaceTemplate");

const slugify = require("slugify");

///////////////////////////////////////////////
// FILES

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}.`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written!");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (error, data1) => {
//   if (error) return console.log("Error!");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (error, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (error, data3) => {
//       console.log(data3);
//       fs.writeFile(
//         "./txt/final.txt",
//         `${data2}\n${data3}`,
//         "utf-8",
//         (error) => {
//           console.log("Your file has been written! 😵‍💫");
//         }
//       );
//     });
//   });
// });
// console.log("Reading file..");

///////////////////////////////////////////////
// SERVER (must create a server and then start the server)

// Make it synchronous since it will only be ran once
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => {
  return slugify(el.productName, { lower: true });
});
console.log(slugs);

const server = http.createServer((req, res) => {
  // callback is called each time a request is sent to the server
  const { query, pathname } = url.parse(req.url, true);

  // Overview Page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });

    const cardsHtml = dataObj
      .map((el) => {
        return replaceTemplate(tempCard, el);
      })
      .join("");

    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);
  }

  // Product Page
  else if (pathname === "/product") {
    res.writeHead(200, {
      "Content-type": "text/html",
    });
    // console.log(query);
    // console.log(query.id);
    const product = dataObj[query.id];

    if (product != null) {
      const output = replaceTemplate(tempProduct, product);
      res.end(output);
    } else {
      res.end("Page not found");
    }
  }

  // API Page
  else if (pathname === "/api") {
    res.writeHead(200, {
      "Content-type": "application/json",
    });
    res.end(data);
  }

  // Page not found Page
  else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello-world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

// Start up the server
server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
