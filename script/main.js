      var currentTrackId = ""
 
function deezerAPI(){
    var config = {
        root:"data/",

    }
        var matches = {
            1954158102:"Essential Michael Jackson",
            1036183001:"Hits of the 80s & 90s",
            3457141922:"Essential Madonna",
            1282495565:"New Releases",
            3155776842:"Most played Worldwide",
            1362519755:"Most played in Portugal",
            3449355042:"Música \"Pimba\" (Música Tradicional Portuguesa)",
            1111142361:"Most played in Mexico",
            1111141961:"TMost played in Brazil",
            1109890291:"Most played in France",
            3110633262:"Pop Rock",
            1313621735:"Most played in the USA",
            3107796422:"Kizomba",
            1111142221:"Most played in the UK",
            1311460845:"Indie",
            1963962142:"Pop",
            706093725:"EDM",
        }

    this.max = parseInt(document.body.getAttribute("data-tracks-max"));

    this.get = function(id, callback){
        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.withCredentials = true;
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            callback(this.response, matches[id], id)
        }
        });

        xhr.open("GET", config.root+id+".json");
        xhr.send(data);
    }
}


function mtvNews(){
    var url = "https://this-makes-no-sense.000webhostapp.com/mtv.php"

    this.get = function(callback){
        var data = null;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            callback(this.response)
        }
        });

        xhr.open("GET", url);
        xhr.send();
    }
}


function setLayout(data, name, id){
        var top = 1;
        var max = parseInt(document.body.getAttribute("data-tracks-max")) + 1;
        var data = JSON.parse(data)
        var tracks = data.tracks.data;
        var templates={
            track:'<div class="playlist-track" data-track="t-{{id}}">\
                    <span data-position="{{position}}" class="position">{{position}}\</span>\
                    <span class="title"><div class="loader"></div>{{title}}</span>\
                    <span class="artist">by {{artist}}</span>\
                    <span class="track-position">\
                  </span>\
                    <audio id="t-{{id}}" style="display:none" src="{{src}}"></audio>\
                  </div>',
            playlist:""
        }
        var trackHTML = "";
        for(var t in tracks){
            var track = tracks[t]
            if(track.hasOwnProperty("preview") && track.preview != ""){
            var html = templates.track.replace(/{{position}}/g, top).replace(/{{id}}/g, parseInt(track.id) + (new Date()).getTime() ).replace(/{{title}}/g, track.title_short).replace("{{artist}}", track.artist.name).replace("{{src}}", track.preview)
            
            trackHTML+=html
            top += 1;
            }
            if(top == max){
                break;
            }
        }

        document.querySelector('[data-playlist-id="'+id+'"] .playlist-header').innerHTML = name;
        document.querySelector('[data-playlist-id="'+id+'"] .playlist-tracks').innerHTML = trackHTML;


        var allAudios = document.querySelectorAll('[data-playlist-id="'+id+'"]  .playlist-track audio');

        for(var a in allAudios){
           allAudios[a].onplay = function(e){

               if(e.target.readyState >= 3){
                var allAudios2 = document.querySelectorAll('[data-playlist-id="'+id+'"]  .playlist-track audio');

                for(var a = 0;a!=allAudios2.length; a++){
                    if(allAudios2[a].id != e.target.id){
                    allAudios2[a].pause();
                    allAudios2[a].currentTime = 0;
                }
                }
                
                e.target.play()
                }
            }
            allAudios[a].oncanplaythrough = function(e){
                var id = e.currentTarget.getAttribute("id");

                if(document.querySelector("[data-track='"+id+"'] .loader")) document.querySelector("[data-track='"+id+"'] .loader").parentElement.removeChild(document.querySelector("[data-track='"+id+"'] .title .loader"))

            }
        }

        var trackDivs = document.querySelectorAll(".playlist-track");

        for(var a in trackDivs){
            var div = trackDivs[a];
            trackDivs[a].onmouseenter = function(e){
                currentTrackId = e.currentTarget.getAttribute("data-track");
                var audio = document.querySelector("#"+currentTrackId);

                if(audio.readyState >= 3) audio.play()
            }

                trackDivs[a].onclick = function(e){
                currentTrackId = e.currentTarget.getAttribute("data-track");
                var audio = document.querySelector("#"+currentTrackId);
                if(audio.paused){
                    audio.play()
                }else{
                                       audio.pause();
                    audio.currentTime = 0; 
                }

                if(audio.readyState >= 3) audio.play()
            }

            trackDivs[a].onmouseleave = function(e){
                currentTrackId = e.currentTarget.getAttribute("data-track");
                var audio = document.querySelector("#"+currentTrackId);

                if(!audio.paused){
                    audio.pause();
                    audio.currentTime = 0;
                }
            }


            trackDivs[a].onblur = function(e){
                currentTrackId = e.currentTarget.getAttribute("data-track");
                var audio = document.querySelector("#"+currentTrackId);

                if(!audio.paused){
                    audio.pause();
                    audio.currentTime = 0;
                }
            }
            
        }





}


(function(){
    var deezer = new deezerAPI();
    console.log(deezer.max)
    var news = new mtvNews()

    var playlists = document.querySelectorAll("[data-playlist-id]");


    for(var p = 0; p!=playlists.length;p++){
        var playlist = playlists[p];
        var playlist_id = parseInt(playlist.getAttribute("data-playlist-id"));

        deezer.get(playlist_id, setLayout);

    }


    news.get(function(res){
        if(!document.querySelector(".rss")) return;
            document.querySelector(".rss").innerHTML = res;
            var items = document.querySelectorAll(".rss item");
            var news = document.querySelectorAll("#news .new");
            var maxNews = parseInt(document.body.getAttribute("data-news-max"));
            var  currentNew = 0;
            for(var i = 0;i!=items.length;i++){
                var item = items[i];
                var image = item.querySelector("media\\:content").getAttribute("url").replace("0.8","1")
                var title = items[i].querySelector("title").innerHTML
                var category =  items[i].querySelector("category").innerHTML.replace("<!--[CDATA[", "").replace("]]-->","")
                var description= items[i].querySelector("description").innerHTML.replace("<!--[CDATA[", "").replace("]]-->","");
                var date = new Date(document.querySelector("item pubdate").innerText); 

                if(category == "Music" && currentNew < maxNews){
                    var currentArticle = news[currentNew];
                    currentArticle.querySelector("h3").innerHTML = title;
                    currentArticle.querySelector("p").innerHTML = description;
                    currentArticle.querySelector(".article-image").style.backgroundImage = "url("+ image +")"
                    currentArticle.querySelector(".news-link").href = document.querySelector("item").innerText.split(" ")[0]
                    //currentArticle.querySelector("time").innerText = date.toDateString()
                    currentNew++
                }
        }

        document.querySelector(".rss").parentElement.removeChild(document.querySelector(".rss"))
    })
})()


