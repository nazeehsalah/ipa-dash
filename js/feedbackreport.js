
var couresList = [],
  colors = ['rgba(34, 102, 102,1)', 'rgba(0,196,194,1)', 'rgba(60,141,188,0.9)', 'rgba(47,94,117,1)', 'rgba(51,34,136,1)', 'rgba(33,151,238)', 'rgba(255,63,121,1)', "rgba(255,211,70,1)", 'rgba(0,104,185,1)', 'rgba(46,135,190,1)', 'rgba(1,7,102,1)', 'rgba(30,132,208,1)', 'rgba(255,63,121,1)', 'rgba(92,0,32,1)']
firebase.database().ref("courses").orderByKey().once("value")
  .then(function (snapshot) {
    index = 0
    options = "",
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        couresList.push({
          key: childSnapshot.key,
          data: childData
        })
        options += '<option value="' + index + '">' + childData.name + '</option>'
        index++;
      });
    $("#prog").append(options)
  })


$(function () {
  $("#report").submit(function (e) {
    e.preventDefault();
    if ($("#prog").val() == null || $("#lang").val() == null) {
      alert("يجب عليك اختيار البرنامج ولغه التقرير")
    }
    else {
      console.log()
      var lang
      if ($("#lang").val() == "ar") {
        $("#datatable-buttons_wrapper table").css("direction", "rtl");
        lang = "feedbackArbic";
      }
      else {
        $("#datatable-buttons_wrapper table").css("direction", "ltr");
        lang = "feedbackEnglish"
      }
      report(couresList[$("#prog").val()].key, lang)
    }
  });

});
function report(courseKey, lang) {
  $("#datatable-buttons").DataTable().destroy();
  $("#datatable-buttons tbody").children().remove();

  var articalQuestions = [],
    chooseQuestions = []
  console.log("courseInfo/" + courseKey + "/" + lang)
  firebase.database().ref("courseInfo/" + courseKey + "/" + lang).once("value")
    .then(function (snap) {
      console.log(snap.val())
      if (snap.val() != null) {

        console.log("if")
        Object.keys(snap.val()).forEach(key => {
          let question = {
            text: key,
            answers: []
          },
            labels = [],
            values = [],
            article = false,
            questionInfo = snap.val()[key]
          Object.keys(questionInfo).forEach(ansKey => {
            if (questionInfo[ansKey].type == "article") {
              article = true
              question.answers.push(questionInfo[ansKey].ans)

            } else {
              for (let i = 0; i < questionInfo[ansKey].answers.length; i++) {
                if (questionInfo[ansKey].ans == questionInfo[ansKey].answers[i]) {
                  if (labels.indexOf(questionInfo[ansKey].ans) == -1) {

                    labels.push(questionInfo[ansKey].ans)
                    values.push(1)
                  } else {

                    values[labels.indexOf(questionInfo[ansKey].ans)] = parseInt(values[labels.indexOf(questionInfo[ansKey].ans)]) + 1

                  }
                }
              }
            }

          })

          if (article)
            articalQuestions.push(question)
          else {
            question.answers.push({
              labels: labels,
              values: values
            })
            chooseQuestions.push(question)
          }

        })
        document.getElementById("test")
        var index = 0
        chooseQuestions.forEach(function (question) {
          index++;
          var rowcontent = "<tr>"
          rowcontent += "<td>" + index + "</td>" +
            "<td>" + question.text + "</td><td><ul class='text-right list-unstyled'>"
          for (let i = 0; i < question.answers[0].labels.length; i++) {
            rowcontent += "<li width=100%><span>" + question.answers[0].labels[i] + ":</span> " +
              question.answers[0].values[i] + "\n</li>"
          }
          rowcontent += "</ul></td><td>" + (lang == "feedbackArbic" ? "اختيارى" : "Choose") + "</td></tr>"
          $("#datatable-buttons tbody").append(rowcontent)

        })
        console.log(articalQuestions)
        articalQuestions.forEach(function (question) {
          index++;
          var rowcontent = "<tr>"
          rowcontent += "<td>" + index + "</td>" +
            "<td>" + question.text + "</td>" + "<td><ol class='list-ulnstyled'>"
          for (let i = 0; i < question.answers.length; i++) {
            rowcontent += "<li>" + question.answers[i] + " <hr></li>"
          }
          rowcontent += "</ol></td><td>" + (lang == "feedbackArbic" ? "مقالى" : "Article") + "</td></tr>"
          $("#datatable-buttons tbody").append(rowcontent)
        })
        $("#tabledata").fadeIn()
        $("#datatable-buttons").length && $("#datatable-buttons").DataTable({
          displayLength: 50,
          dom: "Blfrtip",
          buttons: [{
            extend: "copy",
            className: "btn-sm"
          }, {
            extend: "csv",
            className: "btn-sm"
          }, {
            extend: "excel",
            className: "btn-sm"
          }, {
            extend: "pdfHtml5",
            className: "btn-sm"
          }, {
            extend: "print",
            className: "btn-sm"
          }],
          responsive: !0
        })
      }
      else {
        $("#notfound").fadeIn()
        $("#tabledata").hide()
      }
    })
}
