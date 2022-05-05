const http = require("https");
const cheerio = require("cheerio");

class MangaNato {
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

                        let prevChap = ""
                        let nextChap = "";

                        const nodePrev = $(".navi-change-chapter-btn")
                            .children("a")
                            .first()

                        const nodeNext = $(".navi-change-chapter-btn")
                            .children("a")
                            .last()

                        if (nodePrev.text().toLowerCase().includes("Prev Chapter".toLowerCase())) {
                            prevChap = nodePrev.attr("href");
                        }

                        if (nodeNext.text().toLowerCase().includes("Next Chapter".toLowerCase())) {
                            nextChap = nodeNext.attr("href");
                        }

                        resolve({
                            prevChapter: prevChap,
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
            http.get(url, (resp) => {
                let html = "";

                resp.on("data", (chunk) => {
                    html += chunk;
                });

                resp.on("end", () => {
                    try {
                        const $ = cheerio.load(html);

                        let img = [];
                        $(".container-chapter-reader")
                            .children("img")
                            .each((i, e) => {
                                let src = $(e).attr("src");
                                img.push(src);
                            })

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
        let url = `https://manganato.com/genre-all`;
        if (pageNo > 1) {
            url = url + `/${pageNo}`
        }
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
                        if ($(".panel-content-genres").children("div").length == 0) {
                            resolve({
                                latestManga: [],
                            });
                        } else {
                            $(".panel-content-genres")
                                .children("div")
                                .each((idx, el) => {
                                    let title = $(el)
                                        .children("a")
                                        .attr("title")

                                    let link = $(el)
                                        .children("a")
                                        .attr("href")

                                    let imageLink = $(el)
                                        .children("a")
                                        .children("img")
                                        .attr("src")

                                    tempObj = {
                                        title: title,
                                        link: link,
                                        thumb: imageLink,
                                        src: "MGNT",
                                        description: "",
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
            let url = "https://manganato.com/search/story/" + title.replace(/ /g, "_");
            console.log(url)
            http.get(url, (resp) => {
                let html = "";

                resp.on("data", (chunk) => {
                    html += chunk;
                });

                resp.on("end", () => {
                    try {
                        const $ = cheerio.load(html);

                        $(".panel-search-story").children("div").each((i, e) => {
                            finalArray.push({
                                src: "MGNT",
                                thumb: $(e).children("a").children("img").attr("src"),
                                link: $(e).children("a").attr("href"),
                                title: $(e).children("div").children("h3").children("a").text().trim(),
                            })
                        });

                    } catch (e) {
                        console.log(e);
                    } finally {
                        resolve(finalArray);
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
                        let thumb = $(".story-info-left")
                            .children("span")
                            .children("img")
                            .attr("src")
                        let title = $(".story-info-right")
                            .children("h1")
                            .text();
                        let desc = $(".panel-story-info-description")
                            .text();
                        let status = $(".variations-tableInfo")
                            .children("tbody")
                            .children("tr")
                            .eq(2)
                            .children("td")
                            .eq(1)
                            .text();

                        desc = desc.substring(desc.indexOf(':') + 1)
                        desc = desc.trim();

                        status = status.substring(status.indexOf(':') + 1)
                        status = status.trim()

                        let authors = ""
                        $(".variations-tableInfo")
                            .children("tbody")
                            .children("tr")
                            .eq(1)
                            .children("td")
                            .eq(1)
                            .children("a")
                            .each((idx, el) => {
                                if (authors.length > 0) {
                                    authors = authors + ', ';
                                }
                                authors = authors + el.children[0].data
                            });

                        let update = $(".story-info-right-extent")
                            .children("p")
                            .eq(0)
                            .children("span")
                            .eq(1)
                            .text();

                        let lastChapter = $(".panel-story-chapter-list")
                            .children("ul")
                            .children("li")
                            .eq(0)
                            .children("a")
                            .text()
                            .trim();

                        let chapterList = [];

                        $(".panel-story-chapter-list")
                            .children("ul")
                            .children("li")
                            .each((idx, el) => {
                                chapterList.push({
                                    chapterTitle: $(el).children("a").text().trim(),
                                    chapterLink: $(el).children("a").attr("href"),
                                    chapDate: $(el).children("span").eq(1).attr("title").trim(),
                                });
                            });

                        resolve({
                            mangaInfo: {
                                src: "MGNT",
                                thumb: thumb,
                                title: title,
                                desc: desc,
                                status: status,
                                author: authors,
                                lastUpdate: update,
                                lastChapter: lastChapter,
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
                        let thumb = $(".story-info-left")
                            .children("span")
                            .children("img")
                            .attr("src")
                        let title = $(".story-info-right")
                            .children("h1")
                            .text();
                        let desc = $(".panel-story-info-description")
                            .text();
                        let status = $(".variations-tableInfo")
                            .children("tbody")
                            .children("tr")
                            .eq(2)
                            .children("td")
                            .eq(1)
                            .text();

                        desc = desc.substring(desc.indexOf(':') + 1)
                        desc = desc.trim();

                        status = status.substring(status.indexOf(':') + 1)
                        status = status.trim()

                        let authors = ""
                        $(".variations-tableInfo")
                            .children("tbody")
                            .children("tr")
                            .eq(1)
                            .children("td")
                            .eq(1)
                            .children("a")
                            .each((idx, el) => {
                                if (authors.length > 0) {
                                    authors = authors + ', ';
                                }
                                authors = authors + el.children[0].data
                            });

                        let update = $(".story-info-right-extent")
                            .children("p")
                            .eq(0)
                            .children("span")
                            .eq(1)
                            .text()

                        let lastChapter = $(".panel-story-chapter-list")
                            .children("ul")
                            .children("li")
                            .eq(0)
                            .children("a")
                            .text()
                            .trim();

                        resolve({
                            mangaInfo: {
                                src: "MGNT",
                                thumb: thumb,
                                title: title,
                                desc: desc,
                                status: status,
                                author: authors,
                                lastUpdate: update,
                                lastChapter: lastChapter,
                            },
                        });

                    } catch (e) {
                        console.log(e);
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

                resp.on("end", async () => {
                    const $ = cheerio.load(html);
                    resolve({
                        message: $(".panel-story-chapter-list")
                            .children("ul")
                            .children("li")
                            .eq(0)
                            .children("a")
                            .text()
                            .trim(),
                    });
                });
            });
        });
    }
}

module.exports = MangaNato;