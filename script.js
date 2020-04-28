const form = document.getElementById("form");
const search = document.getElementById("search");
const searchBtn = document.getElementById("search");
const results = document.getElementById("result");
const loader = document.getElementById("loader");
const modal = document.getElementById("modal");
const details = document.getElementById("details");
const audio = document.getElementById("audio");
const playBtn = document.getElementById("play");
const progressContainer = document.getElementById("progress-container");
const progress = document.getElementById("progress");
const audioDetails = document.getElementById("audio-details");
const main = document.querySelector("main");
const errorMsg = document.getElementById("error");
const closeBtn = document.getElementById("close-btn");

const url = "https://api.lyrics.ovh";
const proxy = "https://cors-anywhere.herokuapp.com";
let nextData = "";

async function searchSongs(input) {
  const res = await fetch(`${url}/suggest/${input}`);
  const data = await res.json();

  displayDataToDOM(data);
  search.value = "";
}

async function loadMoreSongs() {
  const resNext = await fetch(`${proxy}/${nextData}`);
  const dataNext = await resNext.json();

  displayDataToDOM(dataNext);
}

async function getLyrics(
  artist,
  songTitle,
  albumTitle,
  songPreview,
  songLink,
  artistCover
) {
  const res = await fetch(`${url}/v1/${artist}/${songTitle}`);
  const data = await res.json();
  try {
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, "<br>");
    audio.setAttribute("src", songPreview);

    audioDetails.innerHTML = `
      <div class="artist-cover-wrap">
        <img src="${artistCover}" alt="${artist} cover photo">
      </div>
      <div class="artist-details">
        <p class="artist-detail">Artist: <span>${artist}</span></p>
        <p class="artist-detail">Song: <span>${songTitle}</span></p>
        <p class="artist-detail">Album: <span>${albumTitle}</span></p>
      </div>
    `;

    details.innerHTML = `
      <div class="lyrics-container">
          <h2 class="song-artist"><strong>${artist}</strong> - ${songTitle}</h2>
          <p class="lyrics">${lyrics}</p> 
      </div>  
      <a class="song-link" href=${songLink} target="_blank">Check out this song</a> 
  
  `;
    modal.classList.add("show");
  } catch (err) {
    errorMsg.innerText = "There are no avalible lyrics for this song";
    errorMsg.style.display = "block";
    setTimeout(() => {
      errorMsg.style.display = "none";
    }, 6000);
  }
}

function displayDataToDOM(data) {
  data.data.forEach((song) => {
    const songListItem = document.createElement("li");
    songListItem.classList = "song";
    songListItem.innerHTML = `
        <div>
          <span class="song-artist"><strong>${song.artist.name}</strong></span> - <span class="song-name"><strong>${song.title}</strong></span>
        </div> 
        <button 
            data-artist="${song.artist.name}" 
            data-songtitle="${song.title}" 
            data-albumtitle="${song.album.title}"
            data-songpreview="${song.preview}"
            data-songlink="${song.artist.link}"
            data-artistcover="${song.artist.picture_medium}"
            class="lyrics-btn" 
        >
            Get lyrics
        </button>
        `;

    results.appendChild(songListItem);
  });
  nextData = data.next;
}

function showLoading() {
  loader.classList.add("show");

  setTimeout(() => {
    loader.classList.remove("show");

    setTimeout(() => {
      loadMoreSongs();
    }, 300);
  }, 1000);
}

function toggleAudioStatus() {
  if (audio.paused) {
    playBtn.querySelector("i.fas").classList.remove("fa-play");
    playBtn.querySelector("i.fas").classList.add("fa-pause");
    audio.play();
  } else {
    audio.pause();
    playBtn.querySelector("i.fas").classList.add("fa-play");
    playBtn.querySelector("i.fas").classList.remove("fa-pause");
  }
}

function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;
}

function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const searchInput = search.value.trim();
  if (searchInput !== "") {
    searchSongs(searchInput);
  } else {
    return;
  }
});

results.addEventListener("click", (e) => {
  const clickedEl = e.target;

  if (clickedEl.tagName === "BUTTON") {
    const artist = clickedEl.getAttribute("data-artist");
    const songTitle = clickedEl.getAttribute("data-songtitle");
    const albumTitle = clickedEl.getAttribute("data-albumtitle");
    const songPreview = clickedEl.getAttribute("data-songpreview");
    const songLink = clickedEl.getAttribute("data-songlink");
    const artistCover = clickedEl.getAttribute("data-artistcover");

    getLyrics(
      artist,
      songTitle,
      albumTitle,
      songPreview,
      songLink,
      artistCover
    );
  }
});

playBtn.addEventListener("click", toggleAudioStatus);

audio.addEventListener("timeupdate", updateProgress);

progressContainer.addEventListener("click", setProgress);

closeBtn.addEventListener("click", () => {
  modal.classList.remove("show");
});

window.addEventListener("click", (e) => {
  e.target === modal ? modal.classList.remove("show") : false;
});

window.addEventListener("scroll", () => {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    showLoading();
  }
});
