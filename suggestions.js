let searchWrapper = document.querySelector(".search-input");
let inputBox = document.querySelector("input");
let suggBox = document.querySelector(".autocom-box");

inputBox.onkeyup = (e) => {
   chrome.windows.create({
      tabId: 80,
      type: 'normal'
     });

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

                  const titles = findMatchingBookmarks(
                     suggestions,
                     validSuggestionsTags
                  );

                  // console.log(titles);

                  const filteredTitles = titles.filter((title) => {
                     return title != undefined ? title : "";
                  });

                  const validBookmarks = findSelectedBookmarks(
                     widgetDetails.bookmarks,
                     filteredTitles
                  );


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
      const tagValues = Object.values([...suggestions[key].tags]);

      return tagValues.flatMap((tagValue) => {
         if (validSuggestionsTags.includes(tagValue)) {
            return key;
         }
      });
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
