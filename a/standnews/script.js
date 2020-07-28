console.clear();

d3.loadData("public/_assets/data.json", function(err, res){

	var data = res[0];

	d3.selectAll(".g-chart").each(function(el, gi){

		var sel = d3.select(this).html("");

		var type = sel.attr("data-type");

		data = data.filter(d => d.date_incident && d.date_latest && d.date_next);

		var name = "";

		var groups = ["done", "trial", "others"];
		var grouphed = ["已完結", "審訊開始", "未審"];

		var div2, eachwrap, width, x;

		sel.append("div.g-group.g-key")


		// groups.forEach(function(group,gi){


			var data_use = data;

			if (type == "done") {
				data_use = data.filter(d => d.status == "已判刑" || d.statue == "罪名不成立")
			}

			if (type == "trial") {
				data_use = data.filter(d => d.date_trial)
			}

			if (type == "others") {
				data_use = data.filter(d => !d.date_trial)
			}

			var cont = sel.append("div.g-group");

			d3.select("p.g-group-hed-" + gi).text(data_use.length + " 人 " + grouphed[gi])


			data_use.forEach(function(d){

				d.date_incident_f = new Date(d.date_incident.split("/")[0], d.date_incident.split("/")[1], d.date_incident.split("/")[1])

				d.date_latest_f = new Date(d.date_latest.split("/")[0], d.date_latest.split("/")[1], d.date_latest.split("/")[1])

				d.date_next_f = d.date_next != "N/A" && d.date_next != "沒有已排期的審訊" ? "" : new Date(d.date_next.split("/")[0], d.date_next.split("/")[1], d.date_next.split("/")[1])

				d.date_trial_f = d.date_trial ? new Date(d.date_trial.split("/")[0], d.date_trial.split("/")[1], d.date_trial.split("/")[1]) : "";

				if (d.case != name) {
					div2 = cont.append("div.g-case")
					div2.append("p.g-case-name").html(d.case.split(" ").join("<br>"))
					name = d.case;

					eachwrap = div2.append("div.g-each-wrap")

					width = eachwrap.node().getBoundingClientRect().width;
					x = d3.scaleLinear().range([0,100]).domain([new Date(2019,5,1), new Date(2021, 5, 1)]);

					var ticks = [new Date(2019,5,1), new Date(2020,0,1), new Date(2020,5,1), new Date(2021,0,1)];

					tick = eachwrap.append("div.g-axis");
					ticks.forEach(function(t,tin){
						var ti = tick.append("div.g-tick").style("left", x(t) + "%")
						ti.append("p").text(tin == 1 ? "2020年" : tin == 2 ? "2021年" : +t.getMonth()+1 + "月")
						ti.append("div.g-line")
					})

				}

				var div3 = eachwrap.append("div.g-each").attr("id", d.case);

				if (d.date_incident_f && d.date_incident_f != "Invalid Date") {
					div3.append("div.g-circle")
						.attr("data-date", d.date_incident_f)
						.style("left", x(d.date_incident_f) + "%")
				}

				if (d.date_latest_f && d.date_latest_f != "Invalid Date") {
					div3.append("div.g-circle")
						.attr("data-date", d.date_latest_f)
						.style("left", x(d.date_latest_f) + "%")
				}

				if (d.date_next_f && d.date_next_f != "Invalid Date") {
					div3.append("div.g-circle")
						.attr("data-date", d.date_next_f)
						.style("left", x(d.date_next_f) + "%")
				}

				if (d.date_trial_f && d.date_trial_f != "Invalid Date") {
					div3.append("div.g-circle")
						.attr("data-date", d.date_trial_f)
						.style("background", "orange")
						.style("left", x(d.date_trial_f) + "%")
				}


				var date_last = d.date_trial_f ? d.date_trial_f : d.date_next_f ? d.date_next_f : d.date_latest_f;


				div3.append("div.g-timeline")
					.style("left", x(d.date_incident_f) + "%")
					.style("width", (x(date_last) - x(d.date_incident_f)) + "%")


			})

		// })





	})


	
	


})