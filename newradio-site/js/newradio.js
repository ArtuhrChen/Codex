(function () {
  // 主音源走 Cloudflare 到 Linode 中繼；備援 stream.php 由本站直連同一台的源站 IP，
  // 繞過 Cloudflare，是一條獨立的路。詳見 stream.php 檔頭說明。
  var streamUrl = "https://live.arthur.com.tw/";
  var backupUrl = "stream.php";

  var audio = document.querySelector("[data-audio]");
  var nativePlayer = document.querySelector(".native-player");
  var button = document.querySelector("[data-play]");
  var status = document.querySelector("[data-status]");
  var player = document.querySelector(".radio-player");
  var isPlaying = false;
  var userStarted = false;
  var waitingTimer = null;

  // 切換狀態
  var usingBackup = false;
  var startedAt = 0;      // 這次播放是從什麼時候開始嘗試的（毫秒）
  var errorCount = 0;     // 這次播放累積遇到幾次 error／stalled

  if (!audio || !button || !status || !player) {
    return;
  }

  audio.src = streamUrl;

  if (nativePlayer) {
    nativePlayer.src = streamUrl;
  }

  // ---------------------------------------------------------------------
  // 什麼情況才算「主音源真的掛了、該切備援」。回傳 true 就切。
  //
  //   reason   "error"（播放器報錯）或 "stalled"（緩衝卡住超過 12 秒）
  //   elapsed  從這次按下播放到現在幾毫秒
  //   errors   這次播放累積的失敗訊號次數（含本次），目前策略未用到，保留供調整
  //
  // 策略：error 立刻切，stalled 才看時間。
  //
  //   error 不會因為「慢」而觸發，只有瀏覽器放棄時才觸發，所以套時間門檻沒有意義。
  //   本機實測：主音源指向查不到的主機時，error 在 144 毫秒就回報。
  //   一度加過「前 5 秒不切」的保護，結果它攔下的正好是真正的故障，反而讓切換永遠不發生。
  //
  //   stalled 相反，行動網路進隧道或電梯都會觸發，源頭通常好好的，所以給它 20 秒再說。
  //
  // 為什麼不切得更敏感：備援是 PHP 逐塊轉送，同樣人數吃的資源比 nginx 高一個量級，
  // 而且跑在共享主機上。網路抖一下就把所有人推過去，備援會先被擠爆。
  //
  // 注意：自動播放被瀏覽器擋下（NotAllowedError）不算失敗，那是權限問題，
  // 切到備援一樣會被擋，所以在呼叫端就先排除掉，不會走到這裡。
  // ---------------------------------------------------------------------
  function shouldFailover(reason, elapsed, errors) {
    if (reason === "error") {
      return true;
    }

    return elapsed > 20000;
  }

  function switchToBackup() {
    if (usingBackup) {
      return false;
    }

    usingBackup = true;
    audio.src = backupUrl;

    if (nativePlayer) {
      nativePlayer.src = backupUrl;
    }

    audio.load();
    audio.play();
    return true;
  }

  // 收到失敗訊號時統一走這裡，由上面的 shouldFailover 決定切不切。
  function considerFailover(reason) {
    if (!userStarted || usingBackup) {
      return false;
    }

    errorCount += 1;

    if (shouldFailover(reason, Date.now() - startedAt, errorCount) === true) {
      return switchToBackup();
    }

    return false;
  }

  function setStatus(text) {
    status.textContent = text;
  }

  function setPlaying(nextPlaying) {
    isPlaying = nextPlaying;
    player.classList.toggle("is-playing", nextPlaying);
    button.setAttribute("aria-label", nextPlaying ? "暫停線上直播" : "播放線上直播");
  }

  function clearWaitingTimer() {
    if (waitingTimer) {
      clearTimeout(waitingTimer);
      waitingTimer = null;
    }
  }

  function armWaitingTimer() {
    clearWaitingTimer();
    waitingTimer = setTimeout(function () {
      if (!isPlaying && userStarted) {
        // 卡住太久：先問要不要切備援，切了就不必再嚇聽眾（靜默切換）
        if (considerFailover("stalled")) {
          setStatus("直播緩衝中...");
          armWaitingTimer();
          return;
        }
        setStatus("連線較慢，請稍候");
      }
    }, 12000);
  }

  function startAudio() {
    userStarted = true;
    startedAt = Date.now();
    errorCount = 0;
    setStatus("正在連線直播...");
    armWaitingTimer();

    audio.load();
    audio.play().then(function () {
      setStatus("直播緩衝中...");
    }).catch(function (err) {
      // 自動播放被擋是權限問題，備援救不了，不要浪費一次切換
      var blocked = err && err.name === "NotAllowedError";

      if (!blocked && considerFailover("error")) {
        setStatus("直播緩衝中...");
        armWaitingTimer();
        return;
      }

      clearWaitingTimer();
      setPlaying(false);
      setStatus(blocked ? "請再按一次播放鍵" : "暫時無法連線，請稍後再試");
    });
  }

  button.addEventListener("click", function () {
    if (isPlaying) {
      audio.pause();
      setPlaying(false);
      setStatus("已暫停，再按一次繼續收聽");
      return;
    }

    startAudio();
  });

  audio.addEventListener("waiting", function () {
    if (userStarted) {
      setStatus("直播緩衝中...");
      armWaitingTimer();
    }
  });

  audio.addEventListener("canplay", function () {
    if (userStarted && !isPlaying) {
      setStatus("準備播放...");
    }
  });

  audio.addEventListener("playing", function () {
    clearWaitingTimer();
    setPlaying(true);
    setStatus("直播收聽中");
  });

  audio.addEventListener("pause", function () {
    clearWaitingTimer();
    setPlaying(false);
  });

  audio.addEventListener("error", function () {
    if (considerFailover("error")) {
      setStatus("直播緩衝中...");
      armWaitingTimer();
      return;
    }

    clearWaitingTimer();
    setPlaying(false);
    setStatus("暫時無法連線，請稍後再試");
  });

  setStatus("按紅色播放鍵，立即收聽");
}());

(function () {
  var feature = document.querySelector("[data-feature-podcast]");
  var list = document.querySelector("[data-podcast-list]");

  if (!feature && !list) {
    return;
  }

  function createEpisodeLink(episode, index) {
    var link = document.createElement("a");
    link.href = episode.url || "https://www.newradio.com.tw/Podcast/";
    link.target = "_blank";
    link.rel = "noopener";

    var number = document.createElement("span");
    number.textContent = String(index + 1).padStart(2, "0");

    var body = document.createElement("div");

    var title = document.createElement("strong");
    title.textContent = episode.title || "Podcast 最新集數";

    var meta = document.createElement("small");
    var parts = [];
    if (episode.date) {
      parts.push(episode.date);
    }
    if (episode.duration) {
      parts.push(episode.duration);
    }
    meta.textContent = parts.join(" / ") || "雲端新廣播 Podcast";

    body.appendChild(title);
    body.appendChild(meta);
    link.appendChild(number);
    link.appendChild(body);
    return link;
  }

  fetch("podcast-latest.json", { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("podcast latest unavailable");
      }
      return response.json();
    })
    .then(function (data) {
      var episodes = Array.isArray(data.episodes) ? data.episodes : [];
      if (!episodes.length) {
        return;
      }

      var first = episodes[0];

      if (feature) {
        feature.href = first.url || "https://www.newradio.com.tw/Podcast/";
        feature.target = "_blank";
        feature.rel = "noopener";
        var featureLabel = feature.querySelector("span");
        var featureTitle = feature.querySelector("h2");
        var featureDesc = feature.querySelector("p");

        if (featureLabel) {
          featureLabel.textContent = "Latest Podcast";
        }
        if (featureTitle) {
          featureTitle.textContent = first.title;
        }
        if (featureDesc) {
          featureDesc.textContent = "最新上架：" + (first.date || "") + "。直播之外，也可從 Podcast 補聽精彩內容。";
        }
      }

      if (list) {
        list.textContent = "";
        episodes.slice(0, 3).forEach(function (episode, index) {
          list.appendChild(createEpisodeLink(episode, index));
        });
      }
    })
    .catch(function () {
      if (list) {
        list.innerHTML = '<a href="https://www.newradio.com.tw/Podcast/"><strong>前往 Podcast 子網站</strong><small>查看最新集數</small></a>';
      }
    });
}());

(function () {
  var cities = [
    { key: "kaohsiung", latitude: 22.6273, longitude: 120.3014 },
    { key: "pingtung", latitude: 22.5519, longitude: 120.5488 }
  ];

  var weatherText = {
    0: "晴朗",
    1: "大致晴朗",
    2: "局部多雲",
    3: "多雲",
    45: "有霧",
    48: "有霧",
    51: "毛毛雨",
    53: "毛毛雨",
    55: "毛毛雨",
    61: "小雨",
    63: "降雨",
    65: "大雨",
    80: "陣雨",
    81: "陣雨",
    82: "強陣雨",
    95: "雷雨",
    96: "雷雨",
    99: "雷雨"
  };

  function setWeather(key, tempText, descText) {
    var temp = document.querySelector('[data-weather-temp="' + key + '"]');
    var desc = document.querySelector('[data-weather-desc="' + key + '"]');

    if (temp) {
      temp.textContent = tempText;
    }

    if (desc) {
      desc.textContent = descText;
    }
  }

  function fetchCity(city) {
    var params = new URLSearchParams({
      latitude: city.latitude,
      longitude: city.longitude,
      current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
      timezone: "Asia/Taipei"
    });

    fetch("https://api.open-meteo.com/v1/forecast?" + params.toString())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("weather request failed");
        }

        return response.json();
      })
      .then(function (data) {
        var current = data.current || {};
        var desc = weatherText[current.weather_code] || "即時天氣";
        var temp = Math.round(current.temperature_2m);
        var humidity = Math.round(current.relative_humidity_2m);
        var wind = Math.round(current.wind_speed_10m);

        setWeather(city.key, temp + "°C", desc + " / 濕度 " + humidity + "% / 風速 " + wind + " km/h");
      })
      .catch(function () {
        setWeather(city.key, "暫無資料", "天氣資料暫時無法取得");
      });
  }

  cities.forEach(fetchCity);
}());
