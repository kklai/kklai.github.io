d3.loadData("quiz.csv", function(err, res){

    let data = res[0];

    let sel = d3.select(".g-quiz-cont").html("");

    let use = data.filter((d,i) => i < 10);

    let correct = 0;

    use.forEach(function(d,i){

        let cont = sel.append("div.g-quiz-item.g-quiz-item-" + i);
        cont.append("div.g-num").text(i+1)
        cont.append("div.g-hint").append("div.g-hint-inner").append("img").attr("src", d["Hint (Photo)"])

        let qsplit = d.Question.split("Ｘ").join("<span class='guess'></span>").split("//").join("<br>");
        console.log(qsplit)
        cont.append("div.g-q").html(qsplit);
        cont.append("div.g-answer");

        cont.append("input#input-" + i).attr("type", "string")
        cont.append("button#button-" + i).text("估！").on("click", function(){
            
            let el = d3.select(this);
            let inputel = d3.select("#input-" + i);
            let input = document.getElementById('input-' + i).value;
            
            if (input == '') { 

                inputel.transition().style("background", "red").transition().style("background", "white")
                
            } else {

                if (input == d.Answer) {
                    el.classed("correct", true);
                    el.text("啱咗 ✔");
                    correct += 1;
                } else {
                    el.classed("wrong", true);
                    el.text("錯咗 ✘");
                }

                let split = d.Answer.split("");
                cont.selectAll(".guess").each(function(d,i){
                    d3.select(this).text(split[i]);
                });

                let title = d["Hint (Title)"] == '' ? d.Answer : d["Hint (Title)"];
                cont.select(".g-answer").text(`${title} - ${d["Hint (Singer)"]}`);



                if (i == use.length -1) {
                    sel.append("div.g-summary")
                        .text(`恭喜你！ ${use.length} 條答中咗 ${correct} 條！`)
                }

            
            }

        })



        // cont.append("div.g-answer.g-hidden")
        //     .text("")



    })

})