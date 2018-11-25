$(function () {
  var couresList = []
  var query = firebase.database().ref("courses").orderByKey();
  query.once("value")
    .then(function (snapshot) {
      var options = "",
        index = 0
      snapshot.forEach(function (childSnapshot) {
        var childData = childSnapshot.val();
        couresList.push({
          key: childSnapshot.key,
          data: childData
        })
        options += '<option value="' + index + '">' + childData.name + '</option>'
        index++;
      });
      $("#sel1").append(options)

    })
  $("#sel1").change(function () {
    $("#datatable-buttons").DataTable().destroy();
    var tabelHeader = "",
      datesList = getDates(new Date(couresList[$(this).val()].data.startDate), new Date()),
      tabelContent = "",
      index = 1
    datesList.forEach(function (d) {
      tabelHeader += '<th class="center">' + d + '</th>'
    })
    $("#datatable-buttons thead tr").append(tabelHeader)
    firebase.database().ref("attendence")
      .orderByChild("courseKey").equalTo(couresList[$(this).val()].key).once("value")
      .then(function (s) {
        if (s.val() != null) {
          var usersKeysIndex = 0;
          Object.keys(s.val()).forEach(function (k) {
            s.val()[k].usersKeys.forEach(function (u) {
              firebase.database().ref("users")
                .orderByKey().equalTo(u.userKey).once("value").then(function (us) {
                  usersKeysIndex++;
                  Object.keys(us.val()).forEach(function (k) {
                    tabelContent = '<tr><td>' + index + '</td>' +
                      '<td>' + us.val()[k].name + '</td>'
                  })
                  var dayFound = false;
                  for (var i = 0; i < datesList.length; i++) {
                    dayFound = false
                    for (var j = 0; j < u.days.length; j++) {
                      if (datesList[i] == u.days[j].date) {

                        dayFound = true;
                        tabelContent += '<td><img src="' + u.days[j].usersData.atteendSign +
                          '" style="width: 75px;"><p>' + u.days[j].usersData.attendTime + ' </p></td>'
                        break
                      }
                      if (!dayFound)
                        tabelContent += '<td>لم يحضر هذا اليوم</td>'
                      if (i == datesList.length - 1)
                        tabelContent += "</tr>"
                    }
                  }
                  index++;
                  $("#datatable-buttons tbody").append(tabelContent)
                  if (usersKeysIndex == s.val()[k].usersKeys.length) {
                    
                    $("#datatable-buttons").length && $("#datatable-buttons").DataTable({
                      dom: "Blfrtip",
                      buttons: [
                        {
                          extend: 'print',
                          exportOptions: {
                            stripHtml: false,
                            format: {
                              body: function (inner, coldex, rowdex) {
                                if (inner.length &= 0) return inner;
                                var el = $.parseHTML(inner);
                                var result = '';
                                $.each(el, function (index, item) {
                                  if (item.nodeName == '#text') result = result + item.textContent;
                                  else if (item.nodeName == 'SUP') result = result + item.outerHTML;
                                  else if (item.nodeName == 'STRONG') result = result + item.outerHTML;
                                  else if (item.nodeName == 'IMG') result = result + item.outerHTML;
                                  else result = result + item.innerText;
                                });
                                return result;
                              }
                            }
                          }
                        },
                        {
                          extend: 'csv',
                          exportOptions: {
                            stripHtml: false,
                            format: {
                              body: function (inner, coldex, rowdex) {
                                if (inner.length &= 0) return inner;
                                var el = $.parseHTML(inner);
                                var result = '';
                                $.each(el, function (index, item) {
                                  if (item.nodeName == '#text') result = result + item.textContent;
                                  else if (item.nodeName == 'SUP') result = result + item.outerHTML;
                                  else if (item.nodeName == 'STRONG') result = result + item.outerHTML;
                                  else if (item.nodeName == 'IMG') result = result + item.src;
                                  else result = result + item.innerText;
                                });
                                return result;
                              }
                            }
                          }
                        },
                      ],
                      responsive: !0
                    })
                    $("#datatable-buttons").css("width", "100%")
                    $(".x_panel").css("display", "inline-block");

                  }
                })
            })
          })
        } else {
          console.log("no attendence")
        }
      })
  });
})

function getDates(startDate, endDate) {
  var dates = [],
    currentDate = startDate,
    addDays = function (days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
    };
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate).toDateString());
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
}