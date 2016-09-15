(function(){
    var mark = document.getElementById("index");
    var span = mark.getElementsByTagName("span")[0];
    var sec = 3;
    var timer = setInterval(function(){
        sec--;
        span.innerHTML = sec + "秒后进入";
    },1000);
    setTimeout(function(){
        mark.style.display = "none";
        clearInterval(timer);
    },3000)
})();
