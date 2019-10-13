$(document).ready(function() {
  let storedBeerId = undefined;
  // initialize dropdown
  $(".collapsible").collapsible();
  // Materialize code to add data for autocomplete search.
  $.ajax("/api/", {
    type: "GET"
  }).then(results => {
    $("input.autocomplete").autocomplete({
      data: results,
      limit: 5,
      onAutocomplete: function() {
        let searchTerm = $("#autocomplete-input-small").val();
        window.location.replace("/results/" + searchTerm);
      }
    });
  });
  // search button
  $("#re-search").on("click", () => {
    let searchTerm = $("#autocomplete-input-small").val();
    window.location.replace("/results/" + searchTerm);
  });

  // review code
  $(".rating-system4").on("click", ".ratinglabel", event => {
    //sets rating value to parent div for later
    $(".rating-system4").data("rating", $(event.target).data("star"));
  });
  $(".result-body").on("click", "#writereview", (event) => {
    $(".reviewmodal").modal("open");
    storedBeerId = $(event.target).data("id");
  });
  $(".reviewmodal-close").on("click", () => {
    $(".reviewmodal-close").modal("close");
  });
  $(".reviewmodal-submit").on("click", () => {
    event.preventDefault();
    let reviewInfo = {
      id: $("#user-info").data("userid"),
      reviewRating: $(".rating-system4").data("rating"),
      reviewParagraph: $("#userreview").val(),
      beerid: storedBeerId
    };
    console.table(reviewInfo);
    $.ajax({
      url: "/api/beer/" + reviewInfo.beerid,
      method: "PUT"
    }).then(result => {
      $.post("/api/review", reviewInfo, () => {
        $(".modal").modal("close");
        window.location.href = window.location.href;
      });
    });
  });
});
