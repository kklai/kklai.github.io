d3.loadData("quiz.csv", function(err, res){

    let data = res[0];

    let use = data.filter((d,i) => i < 10);
    let currentQ = 0;
    let correct = 0;

    let sel = d3.select(".g-quiz-cont-inner").html("").style("width", (use.length+2)*100 + "vw");

    let coverdiv = sel.append("div.g-quiz-item.g-cover").append("div.g-quiz-item-inner");
    coverdiv.append("img.cover").attr("src", "cover.png");

    let intro = coverdiv.append("div.g-intro");
    intro.append("p").text("村快浪男老登七福哭大貫也因王怕田「合下竹兒主教時」哭首女姐綠呀子魚道羊京黃身笑抓，央己放頭送息入對色實布祖紅穴、羽爸訴示牛飯丟司雞秋經合貝也坐寺冰，頁坡言里。")
    intro.append("p").text("了東真杯，申停固說婆乾節乞飛黑可沒高書天用坐買再進，字假校教牛姐話兌夕跳能空蝶院拍乞位交「那常夕日乾」喝未正午次我抄菜穴或。")

    coverdiv.append("button.g-next-button.g-cover-button").html("開始估歌仔").on("click", function(){
        goToNext();
    });

    use.forEach(function(d,i){

        let cont = sel.append("div.g-quiz-item.g-quiz-item-" + i).append("div.g-quiz-item-inner");
        cont.append("div.g-num").text(i+1)
        cont.append("div.g-hint").style("background-image", `url(${d['Hint (Photo)']})`).append("div.g-answer").append("div.g-answer-inner");

        let qsplit = d.Question.split("Ｘ").join("<span class='guess'></span>").split("//").join("<br>");
        console.log(qsplit)
        cont.append("div.g-q").html(qsplit);

        let inputcont = cont.append("div.g-input-cont");
        inputcont.append("input#input-" + i).attr("type", "string")
        cont.append("button#button-" + i).text("估！").on("click", function(){
            
            let el = d3.select(this);
            let inputel = d3.select("#input-" + i);
            let input = document.getElementById('input-' + i).value;
            
            if (input == '') { 

                inputel.transition().style("background", "#ffcc00").transition().style("background", "white")
                
            } else {

                if (input == d.Answer) {
                    inputcont.classed("correct", true);
                    el.text("啱咗 ✔");
                    correct += 1;
                    sel.select(".g-score").html(correct);
                } else {
                    inputcont.classed("wrong", true);
                }

                el.text("下一條");

                let split = d.Answer.split("");
                cont.selectAll(".guess").each(function(d,i){
                    d3.select(this).text(split[i]);
                });

                let title = d["Hint (Title)"] == '' ? d.Answer : d["Hint (Title)"];
                cont.select(".g-answer").classed("g-active", true);
                cont.select(".g-answer-inner").html(`${title}<br>${d["Hint (Singer)"]}`);

                el.on("click", function() {
                    goToNext();
                })
            }
        })

    })

    let enddiv = sel.append("div.g-quiz-item.g-end").append("div.g-quiz-item-inner");
    enddiv.append("img.cover").attr("src", "cover.png");

    let score = enddiv.append("div.g-score-cont");
    score.append("p").html(`恭喜你！<br>${use.length} 條答中咗 <span class='g-score'>${correct}</span> 條！`)

    function goToNext() {
        currentQ += 1;

        if (currentQ < use.length + 2) {
            sel.style("transform", `translate(-${currentQ*100}vw,0`);
        } else {
            currentQ = use.length + 2;
        }
    }

    document.onkeydown = checkKey;

    function checkKey(e) {

        e = e || window.event;

        if (e.keyCode == '37') {
        // left arrow
        }
        else if (e.keyCode == '39') {
        // right arrow
        goToNext()
        }

    }

})