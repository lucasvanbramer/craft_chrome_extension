// this only occurs when the page is ready
$(document).ready(function () {
  var bodies;   // the text bodies sent to CRAFT
  var parents;  // the div elements containing the parent comments
  var content;  // the content of the textarea that the extension user is writing in
  var last_content = null;  // the content last written in the textarea when a snapshot was taken
  var last_target = null;   // the last target of a focus - used to avoid clicking on the same textarea causing a repeat request
  var interval = setInterval(function () { }, 10000);   // placeholder - is used later for recurring requests

  $(document).on("focus", "textarea", function (event) {  // when someone newly selects a textarea to reply, or selects an existing open one
    parents = $(event.target).parents(".comment").toArray().reverse();
    bodies = parents.map(function (parent) {
      return {
        id: $(parent).data("fullname"),
        text: $(parent).children(".entry").find(".usertext-body")[0].innerText
      };
    });
    if (bodies.length > 0 && last_target != event.target) {   // only continues if this comment is a reply to something else and is not already selected
      clearInterval(interval);    // gets rid of the last handler for recurring requests
      last_content = $(event.target).val();
      content = $(event.target).val();
      $.ajax({    // handles sending of request
        url: "http://localhost:8080/extension",     // NOTE: change this to craft.infosci.cornell.edu/extension when ready to deploy
        method: "POST",
        data: JSON.stringify({ existing: bodies, new: content }),
        contentType: 'application/json',
      }).done(function (response) {   // on receiving a 200 response
        response = JSON.parse(response);
        // gets settings from chrome storage that will determine what is shown, and uses the anonymous function as a callback
        chrome.storage.sync.get(["hidecolorelse", "hidecolorself", "hidenumberelse", "hidenumberself"], function (v) {
          const existing = response["existing"];
          if (!v["hidecolorelse"]) {
            // processes all parents and adds a background color to them
            for (var i = 0; i < existing.length; i++) {
              const el_id = "#thing_" + existing[i][0];
              const color = rgb_from_weight(existing[i][1]);
              $(el_id)[0].style.setProperty('background-image', 'none');
              $(el_id)[0].style.setProperty('background-color', color, 'important');
            }
          }
          if (!v["hidecolorself"] && response["new"]) {
            // adds a color to the textarea if there is text in it
            $(event.target)[0].style.setProperty("background-image", "none");
            $(event.target)[0].style.setProperty("background-color", rgb_from_weight(response["new"]), "important");
          }
          if (!v["hidenumberelse"]) {
            // adds CRAFT score numbers to the headlines of each parent comment
            for (var i = 0; i < existing.length; i++) {
              let el_id = "#thing_" + existing[i][0];
              let last_child = $(el_id).children(".entry").find(".tagline").children().last();
              if (last_child.hasClass("craft-score")) {
                last_child.text(" | CRAFT Score: " + existing[i][1].toFixed(4))
              }
              else {
                $('<span class="craft-score"> | CRAFT Score: ' + existing[i][1].toFixed(4) + '</span>').insertAfter($(last_child));
              }
            }
          }
          if (!v["hidenumberself"] && response["new"]) {
            // adds CRAFT score above this comment's text area if there is content in it
            if ($(event.target).prev().length) {
              $(event.target).prev().text("CRAFT Score: " + response["new"].toFixed(4));
            }
            else {
              $("<p>CRAFT Score: " + response["new"].toFixed(4) + "</p>").insertBefore($(event.target));
            };
          }
        });
      }).fail(function (response) {
        console.log("Error reaching CRAFT server:")
        console.log(response);
      });

      interval = setInterval(function () {
        // every five seconds, send a new request with the contents of the textarea IF...
        content = $(event.target).val();
        if (content !== last_content) {   // ... THE content in it has changed
          $.ajax({
            url: "http://localhost:8080/extension",
            method: "POST",
            data: JSON.stringify({ existing: bodies, new: content }),
            contentType: 'application/json',
          }).done(function (response) {
            // this does the same exact things as the function on the response earlier (could probably be refactored, but the async
            // involved in it made me nervous about refactoring.
            response = JSON.parse(response);
            chrome.storage.sync.get(["hidecolorelse", "hidecolorself", "hidenumberelse", "hidenumberself"], function (v) {
              const existing = response["existing"];
              if (!v["hidecolorelse"]) {
                for (var i = 0; i < existing.length; i++) {
                  const el_id = "#thing_" + existing[i][0];
                  const color = rgb_from_weight(existing[i][1]);
                  $(el_id)[0].style.setProperty('background-image', 'none');
                  $(el_id)[0].style.setProperty('background-color', color, 'important');
                }
              }
              if (!v["hidecolorself"] && response["new"]) {
                $(event.target)[0].style.setProperty("background-image", "none");
                $(event.target)[0].style.setProperty("background-color", rgb_from_weight(response["new"]), "important");
              }
              if (!v["hidenumberelse"]) {
                for (var i = 0; i < existing.length; i++) {
                  let el_id = "#thing_" + existing[i][0];
                  let last_child = $(el_id).children(".entry").find(".tagline").children().last();
                  if (last_child.hasClass("craft-score")) {
                    last_child.text(" | CRAFT Score: " + existing[i][1].toFixed(4))
                  }
                  else {
                    $('<span class="craft-score"> | CRAFT Score: ' + existing[i][1].toFixed(4) + '</span>').insertAfter($(last_child));
                  }
                }
              }
              if (!v["hidenumberself"] && response["new"]) {
                if ($(event.target).prev().length) {
                  $(event.target).prev().text("CRAFT Score: " + response["new"].toFixed(4));
                }
                else {
                  $("<p>CRAFT Score: " + response["new"].toFixed(4) + "</p>").insertBefore($(event.target));
                };
              }
            });
          }).fail(function (response) {
            console.log("Error reaching CRAFT server:")
            console.log(response);
          });
        }
        last_content = content;
      }, 5000);
    }
    last_target = event.target;
  });
});

// calculates color red from the CRAFT score weight - squares weight so that low scores are very light colored.
function rgb_from_weight(weight) {
  const gb = Math.round(255 - weight * weight * 255);
  return `rgb(255, ${gb}, ${gb})`
}
