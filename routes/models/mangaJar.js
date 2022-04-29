const http = require("https");
const cheerio = require("cheerio");

class MangaJar {
  getPrevNextChapters(url) {
    return new Promise((resolve, reject) => {
      var options = {
        method: 'GET'
      };

      http.get(url, options, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);

            let nextChap = "";

            const nodeNext = $(".col-12")
              .children("a")
              .last()

            if (nodeNext.text().toLowerCase().includes("Next Chapter".toLowerCase())) {
              nextChap = "https://mangajar.com" + nodeNext
                .attr("href");
            }

            resolve({
              prevChapter: null,
              nextChapter: nextChap,
            });

          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getImageList(url) {
    return new Promise((resolve, reject) => {
      var options = {
        headers: {
          Cookie: "adultConfirmed=1;",
        }
      }

      http.get(url, options, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let img = [];
            // console.log(html)
            $(".carousel-inner")
              .children(".carousel-item")
              .each((i, e) => {
                let text = $(e).text();
                console.log(text)
                if (text.indexOf("Last chapter") == -1) {
                  let src = $(e).children("img").attr("data-src");
                  if (src === undefined) {
                    src = $(e).children("img").attr("src");
                  }
                  img.push(src);
                }
              })
            if (img.length === 0) {
              $(".chapter-images")
                .children("img")
                .each((i, e) => {
                  let src = $(e).attr("data-src");
                  if (src === undefined) {
                    src = $(e).attr("src");
                  }
                  img.push(src);

                })
            }
            resolve({ imageList: img });
          } catch (error) {
            console.log(error);
          }
        });

        resp.on("error", () => {
          console.log(error);
        });
      });
    });
  }

  getMangaList(pageNo) {
    let url = `https://mangajar.com/manga?sortBy=-last_chapter_at&page=${pageNo}`;
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];
            let tempObj = {};
            if ($(".card-body").children("div").eq(0).children("article").length == 0) {
              resolve({
                latestManga: [],
              });
            } else {
              $(".card-body")
                .children("div")
                .eq(0)
                .children("article")
                .each((idx, el) => {
                  let title = $(el)
                    .children("a")
                    .eq(0)
                    .attr("title")
                  // console.log(title)
                  let link = $(el)
                    .children("a")
                    .attr("href")

                  link = "https://mangajar.com" + link;
                  let imageLink = $(el)
                    .children("a")
                    .children("img")
                    .attr("data-src")

                  if (imageLink === undefined) {
                    imageLink = $(el)
                      .children("a")
                      .children("img")
                      .attr("src")
                  }

                  tempObj = {
                    description: "",
                    title: title,
                    link: link,
                    thumb: imageLink,
                    src: "MGJR",
                  };

                  mangaArr.push(tempObj);
                });

              resolve({
                mangaList: mangaArr,
              });
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
    });
  }

  search(maxItem, title, finalArray) {
    return new Promise((resolve, reject) => {
      let url = "https://mangajar.com/search?q=" + encodeURI(title);
      console.log(url)
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            //console.log(html)
            for (let i = 0; i < maxItem; i++) {
              if (
                $(".row")
                  .children("div")
                  .children("div")
                  //.eq(0)
                  .children("article").eq(i).length !== 0

              ) {

                finalArray.push({
                  src: "MGJR",
                  thumb: $(".row")
                    .children("div")
                    .children("div")
                    //.eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .children("img")
                    .attr("src"),
                  link:
                    "https://mangajar.com" +
                    $(".row")
                      .children("div")
                      .children("div")
                      //.eq(0)
                      .children("article")
                      .eq(i)
                      .children("a")
                      .attr("href"),

                  title: $(".row")
                    .children("div")
                    .children("div")
                    //.eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .attr("title")
                  //.trim(),
                });
              }
            }
          } catch (e) {
            console.log(e);
          } finally {
            resolve(finalArray);
          }
        });
      });
    });
  }

  getLatestChapter(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            resolve({
              message: $(".chapter-list-container")
                .children("li")
                .eq(0)
                .children("a").children("span").text().trim()
            });
          } catch (error) {
            console.log(e);
          }
        });
      });
    });
  }

  getMangaInfo(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";
        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", async () => {
          try {
            const $ = cheerio.load(html);
            let thumb = $(".card-body")
              .eq(0)
              .children("div")
              .eq(0)
              .children("div")
              .eq(0)
              .children("img")
              .attr("src");
            let title = $(".card-body")
              .children("h1")
              .children("span")
              .text();
            let desc = $(".manga-description")
              .text()
              .trim();
            let status = $(".card-body")
              .children("div")
              .eq(0)
              .children("div")
              .eq(1)
              .children(".post-info")
              .children("span")
              .eq(1)
              .text();
            status = status.substring(status.indexOf(':') + 1)
            status = status.trim()

            let chapterList = [];

            $(".chapter-list-container")
              .children("li")
              .each((idx, el) => {
                chapterList.push({
                  chapterTitle: $(el).children("a").children("span").text().trim(),
                  chapterLink: "https://mangajar.com" + $(el).children("a").attr("href"),
                  chapDate: $(el).children("span").text().trim(),
                });
              });

            let lastUpdate = $(".chapter-list-container")
              .children("li")
              .eq(0)
              .children("span").text().trim()

            let chap_pages = $(".chapters-infinite-pagination").children("nav").children(".pagination").children(".page-item").length - 3;
            let $2 = null

            function doRequest(link) {
              let chap_list = [];
              try {
                return new Promise((resolve, reject) => {

                  http.get(link, (resp) => {
                    let html = "";

                    resp.on("data", (chunk) => {
                      html += chunk;
                    });

                    resp.on("end", () => {
                      $2 = cheerio.load(html);
                      $2(".chapter-list-container")
                        .children("li")
                        .each((idx, el) => {
                          chap_list.push({
                            chapterTitle: $2(el).children("a").children("span").text().trim(),
                            chapterLink: "https://mangajar.com" + $2(el).children("a").attr("href"),
                            chapDate: $2(el).children("span").text().trim(),
                          });
                        });

                      resolve(chap_list)

                    })
                  }).on('error', (e) => {
                    console.error(e);
                  });

                });
              }
              catch (error) {
                console.log(error)
              }
            }

            for (let i = 2; i < chap_pages + 2; i++) {
              let link = "https://mangajar.com" + $(".pagination").children("li").eq(i).children("a").attr("href");
              chapterList = chapterList.concat(await doRequest(link));

            }

            resolve({
              mangaInfo: {
                src: "MGJR",
                thumb: thumb,
                title: title,
                desc: desc,
                status: status,
                author: "",
                lastUpdate: lastUpdate,
                chapterList: chapterList,
              },
            });

          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getMangaMeta(url) {
    return new Promise((resolve, reject) => {
      http.get(url, (resp) => {
        let html = "";
        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", async () => {
          try {
            const $ = cheerio.load(html);
            let thumb = $(".card-body")
              .eq(0)
              .children("div")
              .eq(0)
              .children("div")
              .eq(0)
              .children("img")
              .attr("src");
            let title = $(".card-body")
              .children("h1")
              .children("span")
              .text();
            let desc = $(".manga-description")
              .text()
              .trim();
            let status = $(".card-body")
              .children("div")
              .eq(0)
              .children("div")
              .eq(1)
              .children(".post-info")
              .children("span")
              .eq(1)
              .text();
            status = status.substring(status.indexOf(':') + 1)
            status = status.trim()

            let lastUpdate = $(".chapter-list-container")
              .children("li")
              .eq(0)
              .children("span").text().trim()

            resolve({
              mangaInfo: {
                src: "MGJR",
                thumb: thumb,
                title: title,
                desc: desc,
                status: status,
                author: "",
                lastUpdate: lastUpdate,
              },
            });

          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getGenre() {
    return new Promise((resolve, reject) => {
      let url = "https://mangajar.com/genre";
      let genreList = [];
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            $(".card-body")
              .children("div")
              .children("div")
              .each((i, el) => {
                genreList.push({
                  link: encodeURI("https://mangajar.com" + $(el).children("a").attr("href")),
                  title: $(el).children("a").text(),
                });
              });

            resolve({ genreList: genreList });
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  getGenreManga(link, page) {
    return new Promise((resolve, reject) => {
      let url = link + `?page=${page}`;
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let mangaArr = [];
            let tempObj = {};

            // if ($(".row").eq(2).children("article").length == 0) {
            //   resolve({
            //     LatestManga: [],
            //   });
            // } else {
            $(".flex-item-mini")
              .each((idx, el) => {
                let title = $(el)
                  .children("div")
                  .children("a")
                  .children("img")
                  .attr("title")
                  .trim();
                let link = $(el)
                  .children("div")
                  .children("a")
                  .attr("href");
                link = "https://mangajar.com" + link;
                let imageLink = $(el)
                  .children("div")
                  .children("a")
                  .children("img")
                  .attr("data-src")
                tempObj = {
                  description: "",
                  title: title,
                  link: link,
                  thumb: imageLink,
                };
                mangaArr.push(tempObj);
              });

            resolve({
              LatestManga: mangaArr,
            });
            // }
          } catch (e) {
            console.log(e);
          }
        });
      });
    });
  }

  //Error Fix For Link
  getLinkFromName(name) {
    return new Promise((resolve, reject) => {
      // console.log(name)

      let url = "https://mangajar.com/search?q=" + encodeURI(name.split('-')[0]);
      console.log(url)
      http.get(url, (resp) => {
        let html = "";

        resp.on("data", (chunk) => {
          html += chunk;
        });

        resp.on("end", () => {
          try {
            const $ = cheerio.load(html);
            let maxItem = 1
            let link = ''
            for (let i = 0; i < maxItem; i++) {
              if (
                $(".row")
                  .children("div")
                  .children("div")
                  .eq(0)
                  .children("article").length !== 0
              ) {
                link =
                  "https://mangajar.com" +
                  $(".row")
                    .children("div")
                    .children("div")
                    .eq(0)
                    .children("article")
                    .eq(i)
                    .children("a")
                    .attr("href")

                resolve({ link: link, name: name.split('- ')[0].trim() })
              }
            }
          }
          catch (e) {
            console.log(e);
          }
        });
      });
    });
  }
}

module.exports = MangaJar;
