$(document).ready(function () {
  var bodies;
  var parents;
  var content;
  var last_content = null;
  var last_target = null;
  var interval = setInterval(function () { }, 10000);

  $(document).on("focus", "textarea", function (event) {
    parents = $(event.target).parents(".comment").toArray().reverse();
    bodies = parents.map(function (parent) {
      return {
        id: $(parent).data("fullname"),
        text: $(parent).children(".entry").find(".usertext-body")[0].innerText
      };
    });
    if (bodies.length > 0 && last_target != event.target) {
      clearInterval(interval);
      last_content = $(event.target).val();
      content = $(event.target).val();
      $.ajax({
        url: "http://localhost:8080/extension",
        method: "POST",
        data: JSON.stringify({ existing: bodies, new: content }),
        contentType: 'application/json',
      }).done(function (response) {
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

      interval = setInterval(function () {
        content = $(event.target).val();
        if (content !== last_content) {
          $.ajax({
            url: "http://localhost:8080/extension",
            method: "POST",
            data: JSON.stringify({ existing: bodies, new: content }),
            contentType: 'application/json',
          }).done(function (response) {
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


function rgb_from_weight(weight) {
  const gb = Math.round(255 - weight * 255);
  return `rgb(255, ${gb}, ${gb})`
}