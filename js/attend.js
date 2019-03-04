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
    /* datesList.forEach(function (d) {
      tabelHeader += '<th class="center">' + d + '</th>'
    }) */
    /* $("#datatable-buttons thead tr").append(tabelHeader) */
    firebase.database().ref("courseInfo/" + couresList[$(this).val()].key)
      .once("value")
      .then(function (s) {
        Object.keys(s.val().attendence).forEach(function (dayKey) {
          tabelHeader += '<th class="center">' + dayKey + '</th>'
        })
        Object.keys(s.val().users).forEach(function (userKey) {
          console.log(userKey)
          firebase.database().ref("users/" + userKey)
            .once("value")
            .then(function (userdata) {
              tabelContent += '<tr>' +
                '<td>' + index + '</td>' +
                '<td>' + userdata.val().name + '</td>'
              Object.keys(s.val().attendence).forEach(function (dayKey) {
                tabelContent += '<td>' + (s.val().attendence[dayKey][userKey] != undefined ? '<img src="' + s.val().attendence[dayKey][userKey].atteendSign +
                  '" style="width: 75px;display:block"><p>' + s.val().attendence[dayKey][userKey].attendTime + ' </p>' : "لم يحضر") + '</td>'
              })
              tabelContent += '</tr>'
              index++;
            }).then(function () {
              if (Object.keys(s.val().users).indexOf(userKey) == Object.keys(s.val().users).length - 1) {
                $("#datatable-buttons thead tr").append(tabelHeader)
                $("#datatable-buttons tbody").append(tabelContent)
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
  })


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