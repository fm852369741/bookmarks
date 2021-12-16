document.head.innerHTML =
   '<style>@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500;600;700&display=swap");* {margin: 0;padding: 0;box-sizing: border-box;font-family: "Poppins", sans-serif;}body{width:100vw;height:100vh;overflow:hidden;background:#664aff !important}::selection {color: #fff;background: #664aff;}.wrapper {max-width: 450px;margin: 150px auto;}.wrapper .search-input {background: #fff;width: 100%;border-radius: 5px;position: relative;box-shadow: 0px 1px 5px 3px rgba(0, 0, 0, 0.12);}.search-input input {height: 55px;width: 100%;outline: none;border: none;border-radius: 5px;padding: 0 60px 0 20px;font-size: 18px;box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);}.search-input.active input {border-radius: 5px 5px 0 0;}.search-input .autocom-box {padding: 0;opacity: 0;pointer-events: none;max-height: 280px;overflow-y: auto;}.search-input.active .autocom-box {padding: 10px 8px;opacity: 1;pointer-events: auto;}.autocom-box li {list-style: none;padding: 8px 12px;display: none;width: 100%;cursor: default;border-radius: 3px;}.search-input.active .autocom-box li {display: block;}.autocom-box li:hover {background: #efefef;}.search-input .icon {position: absolute;right: 0px;top: 0px;height: 55px;width: 55px;text-align: center;line-height: 55px;font-size: 20px;color: #644bff;cursor: pointer;}</style>';
document.body.innerHTML =
   '<div class="wrapper"><div class="search-input"><a href="" target="_blank" hidden></a><input type="text" placeholder="Type to search.." /><div class="autocom-box"></div><div class="icon"><i class="fas fa-search"></i></div></div></div>';

let searchWrapper = document.querySelector(".search-input");
let inputBox = document.querySelector("input");
let suggBox = document.querySelector(".autocom-box");

inputBox.onkeyup = (e) => {
   chrome.storage.local.get(["widgetDetails"], ({ widgetDetails }) => {
      if (widgetDetails.bookmarks.length === widgetDetails.tags.length) {
         const suggestions = [];
         const tags = [];
         const userInput = e.target.value;

         if (userInput) {
            widgetDetails.bookmarks.map((bookmark, index) => {
               suggestions[bookmark.title] = widgetDetails.tags[index];
               tags.push(...widgetDetails.tags[index].tags);

               if (index + 1 === widgetDetails.bookmarks.length) {
                  const validSuggestionsTags = tags.filter((tag) => {
                     return tag
                        .toLocaleLowerCase()
                        .startsWith(userInput.toLocaleLowerCase());
                  });

                  console.log(validSuggestionsTags);

                  const titles = findMatchingBookmarks(
                     suggestions,
                     validSuggestionsTags
                  );

                  console.log(titles);

                  const filteredTitles = titles.filter((title) => {
                     return title != undefined ? title : "";
                  });

                  const validBookmarks = findSelectedBookmarks(
                     widgetDetails.bookmarks,
                     filteredTitles
                  );

                  console.log(validBookmarks);

                  const filteredBookmarks = validBookmarks.filter(
                     (bookmark) => {
                        return bookmark != undefined ? bookmark : "";
                     }
                  );

                  if (filteredBookmarks.length < 1) {
                     searchWrapper.classList.remove("active");
                  }

                  const list = filteredBookmarks.flatMap((bookmark) => {
                     return `<li class="suggestion" url=${bookmark.url}>${bookmark.title}</li>`;
                  });

                  suggBox.innerHTML = list.join("");
                  searchWrapper.classList.add("active");

                  const suggestionsList =
                     document.querySelectorAll(".suggestion");

                  suggestionsList.forEach((suggestionItem) => {
                     suggestionItem.addEventListener("click", (e) => {
                        window.open(e.target.getAttribute("url"));
                     });
                  });
               }
            });
         } else {
            searchWrapper.classList.remove("active");
         }
      }
   });
};

function findMatchingBookmarks(suggestions, validSuggestionsTags) {
   const keys = Object.keys(suggestions);

   return keys.flatMap(function (key) {
      const tabValues = Object.values([...suggestions[key].tags]);

      if (tabValues.every((item) => validSuggestionsTags.includes(item))) {
         return key;
      }
   });
}

function findSelectedBookmarks(bookmarks, validTitles) {
   return validTitles.flatMap((title) => {
      return bookmarks.flatMap((bookmark) => {
         if (bookmark.title === title) {
            return bookmark;
         }
      });
   });
}
