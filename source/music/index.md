---
title: music
date: 2024-04-22 12:41:14
type: "music"
---

<style>
/* 音乐播放器页面样式 */
.music-player-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.95) 0%, 
    rgba(31, 41, 55, 0.95) 50%, 
    rgba(55, 65, 81, 0.95) 100%);
  border-radius: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  min-height: 80vh;
}

/* 主播放器区域 */
.main-player {
  margin-bottom: 40px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.current-song {
  display: flex;
  gap: 40px;
  align-items: center;
}

/* 专辑封面区域 */
.album-art {
  position: relative;
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.album-art img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
}

.vinyl-disc {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(from 0deg, 
    rgba(0, 0, 0, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 25%, 
    rgba(0, 0, 0, 0.1) 50%, 
    rgba(255, 255, 255, 0.05) 75%);
  animation: spin 20s linear infinite;
  animation-play-state: paused;
}

.vinyl-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30px;
  height: 30px;
  background: #1a1a1a;
  border-radius: 50%;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 歌曲信息区域 */
.song-details {
  flex: 1;
}

.current-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 10px 0;
  background: linear-gradient(135deg, #fff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.current-artist {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 30px 0;
}

/* 主控制按钮 */
.main-controls {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.ctrl-btn {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.ctrl-btn.play-pause {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  font-size: 24px;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.5);
}

.ctrl-btn.play-pause:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.6);
}

/* 进度条容器 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  min-width: 40px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 3px;
  width: 0%;
  transition: width 0.1s ease;
}

.progress-handle {
  position: absolute;
  top: 50%;
  left: 0%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  cursor: grab;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

/* 播放列表 */
.playlist {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.playlist-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.playlist-title i {
  color: #3b82f6;
}

/* 歌曲列表项 */
.song-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.song-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.song-item.active {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.song-item.active .song-meta h4 {
  color: #3b82f6;
}

.song-cover {
  position: relative;
  width: 50px;
  height: 50px;
  flex-shrink: 0;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.play-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(59, 130, 246, 0.8);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-item:hover .play-indicator,
.song-item.active .play-indicator {
  opacity: 1;
}

.song-meta {
  flex: 1;
  min-width: 0;
}

.song-meta h4 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-meta p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-duration {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  margin-right: 16px;
}

.song-actions {
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-item:hover .song-actions {
  opacity: 1;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.action-btn.liked {
  color: #ef4444;
}

/* 深色模式适配 */
[data-theme="dark"] .music-player-page {
  background: linear-gradient(135deg, 
    rgba(17, 24, 39, 0.98) 0%, 
    rgba(31, 41, 55, 0.98) 50%, 
    rgba(55, 65, 81, 0.98) 100%);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .music-player-page {
    margin: 0 10px;
    padding: 16px;
  }
  
  .main-player {
    padding: 24px;
  }
  
  .current-song {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .album-art {
    width: 160px;
    height: 160px;
  }
  
  .current-title {
    font-size: 2rem;
  }
  
  .main-controls {
    justify-content: center;
  }
  
  .song-item {
    padding: 8px 12px;
  }
  
  .song-cover {
    width: 40px;
    height: 40px;
  }
  
  .playlist {
    padding: 16px;
  }
}

/* 播放状态动画 */
.playing .vinyl-disc {
  animation-play-state: running;
}

/* 音频可视化效果 */
.audio-visualizer {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 30px;
  margin-left: 10px;
}

.audio-bar {
  width: 3px;
  background: linear-gradient(to top, #3b82f6, #1d4ed8);
  border-radius: 2px;
  animation: audioWave 1s ease-in-out infinite;
}

.audio-bar:nth-child(2) { animation-delay: 0.1s; }
.audio-bar:nth-child(3) { animation-delay: 0.2s; }
.audio-bar:nth-child(4) { animation-delay: 0.3s; }
.audio-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes audioWave {
  0%, 100% { height: 5px; }
  50% { height: 25px; }
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // 歌曲数据
  const songs = [
    { title: '富士山下', artist: '陈奕迅', duration: '3:55', image: '/img/eason-1.jpg', totalSeconds: 235 },
    { title: '十年', artist: '陈奕迅', duration: '4:21', image: '/img/eason-2.jpg', totalSeconds: 261 },
    { title: '红玫瑰', artist: '陈奕迅', duration: '4:02', image: '/img/eason-3.jpg', totalSeconds: 242 },
    { title: '爱情转移', artist: '陈奕迅', duration: '4:38', image: '/img/eason-4.jpg', totalSeconds: 278 },
    { title: '浮夸', artist: '陈奕迅', duration: '3:47', image: '/img/eason-5.jpg', totalSeconds: 227 },
    { title: '单车', artist: '陈奕迅', duration: '4:15', image: '/img/eason-6.jpg', totalSeconds: 255 }
  ];

  let currentSongIndex = 0;
  let isPlaying = false;
  let currentTime = 0;
  let progressInterval;

  // DOM 元素
  const mainPlayBtn = document.getElementById('main-play');
  const mainTitle = document.getElementById('main-title');
  const mainArtist = document.getElementById('main-artist');
  const mainAlbumImg = document.getElementById('main-album-img');
  const progressBar = document.getElementById('main-progress');
  const progressFill = progressBar.querySelector('.progress-fill');
  const progressHandle = progressBar.querySelector('.progress-handle');
  const currentTimeSpan = document.querySelector('.current-time');
  const totalTimeSpan = document.querySelector('.total-time');
  const songItems = document.querySelectorAll('.song-item');
  const vinylDisc = document.querySelector('.vinyl-disc');
  const musicPlayerPage = document.querySelector('.music-player-page');

  // 初始化
  updateMainPlayer();
  updatePlaylist();

  // 播放/暂停切换
  function togglePlay() {
    isPlaying = !isPlaying;
    const icon = mainPlayBtn.querySelector('i');
    
    if (isPlaying) {
      icon.className = 'fas fa-pause';
      startProgress();
      musicPlayerPage.classList.add('playing');
    } else {
      icon.className = 'fas fa-play';
      stopProgress();
      musicPlayerPage.classList.remove('playing');
    }
    
    updatePlaylistIndicators();
  }

  // 开始进度条动画
  function startProgress() {
    progressInterval = setInterval(() => {
      currentTime += 0.5;
      const currentSong = songs[currentSongIndex];
      
      if (currentTime >= currentSong.totalSeconds) {
        currentTime = 0;
        nextSong();
        return;
      }
      
      updateProgressBar();
      updateTimeDisplay();
    }, 500);
  }

  // 停止进度条动画
  function stopProgress() {
    clearInterval(progressInterval);
  }

  // 更新进度条
  function updateProgressBar() {
    const currentSong = songs[currentSongIndex];
    const percentage = (currentTime / currentSong.totalSeconds) * 100;
    progressFill.style.width = percentage + '%';
    progressHandle.style.left = percentage + '%';
  }

  // 更新时间显示
  function updateTimeDisplay() {
    currentTimeSpan.textContent = formatTime(Math.floor(currentTime));
  }

  // 格式化时间
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // 更新主播放器显示
  function updateMainPlayer() {
    const currentSong = songs[currentSongIndex];
    mainTitle.textContent = currentSong.title;
    mainArtist.textContent = currentSong.artist;
    mainAlbumImg.src = currentSong.image;
    mainAlbumImg.alt = currentSong.title;
    totalTimeSpan.textContent = currentSong.duration;
    currentTime = 0;
    updateProgressBar();
    updateTimeDisplay();
  }

  // 更新播放列表
  function updatePlaylist() {
    songItems.forEach((item, index) => {
      item.classList.toggle('active', index === currentSongIndex);
    });
  }

  // 更新播放列表指示器
  function updatePlaylistIndicators() {
    songItems.forEach((item, index) => {
      const indicator = item.querySelector('.play-indicator i');
      if (index === currentSongIndex && isPlaying) {
        indicator.className = 'fas fa-pause';
      } else {
        indicator.className = 'fas fa-play';
      }
    });
  }

  // 切换到指定歌曲
  function switchToSong(index) {
    if (index === currentSongIndex && isPlaying) {
      togglePlay();
      return;
    }
    
    currentSongIndex = index;
    const wasPlaying = isPlaying;
    
    if (isPlaying) {
      stopProgress();
      isPlaying = false;
    }
    
    updateMainPlayer();
    updatePlaylist();
    
    if (wasPlaying || index !== currentSongIndex) {
      setTimeout(() => togglePlay(), 100);
    }
  }

  // 下一首歌
  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    updateMainPlayer();
    updatePlaylist();
    
    if (isPlaying) {
      startProgress();
    }
  }

  // 上一首歌
  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    updateMainPlayer();
    updatePlaylist();
    
    if (isPlaying) {
      startProgress();
    }
  }

  // 事件监听器
  mainPlayBtn.addEventListener('click', togglePlay);

  // 主控制按钮
  document.querySelector('.ctrl-btn.prev').addEventListener('click', prevSong);
  document.querySelector('.ctrl-btn.next').addEventListener('click', nextSong);

  // 进度条点击
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const currentSong = songs[currentSongIndex];
    currentTime = percentage * currentSong.totalSeconds;
    updateProgressBar();
    updateTimeDisplay();
  });

  // 播放列表点击
  songItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      switchToSong(index);
    });
    
    // 播放指示器点击
    const playIndicator = item.querySelector('.play-indicator');
    playIndicator.addEventListener('click', (e) => {
      e.stopPropagation();
      switchToSong(index);
    });
    
    // 喜欢按钮
    const likeBtn = item.querySelector('.action-btn.like');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const icon = likeBtn.querySelector('i');
      if (icon.className.includes('far')) {
        icon.className = 'fas fa-heart';
        likeBtn.classList.add('liked');
      } else {
        icon.className = 'far fa-heart';
        likeBtn.classList.remove('liked');
      }
    });
  });

  // 随机播放按钮
  document.querySelector('.ctrl-btn.shuffle').addEventListener('click', function() {
    this.classList.toggle('active');
    this.style.color = this.classList.contains('active') ? '#3b82f6' : '';
  });

  // 循环播放按钮
  document.querySelector('.ctrl-btn.repeat').addEventListener('click', function() {
    this.classList.toggle('active');
    this.style.color = this.classList.contains('active') ? '#3b82f6' : '';
  });

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch(e.code) {
      case 'Space':
        e.preventDefault();
        togglePlay();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        prevSong();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSong();
        break;
    }
  });

  // 添加音频可视化效果
  function createAudioVisualizer() {
    const visualizer = document.createElement('div');
    visualizer.className = 'audio-visualizer';
    
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.className = 'audio-bar';
      bar.style.height = Math.random() * 20 + 5 + 'px';
      visualizer.appendChild(bar);
    }
    
    return visualizer;
  }

  // 在当前播放的歌曲项添加可视化效果
  function updateVisualizer() {
    songItems.forEach((item, index) => {
      const existingVisualizer = item.querySelector('.audio-visualizer');
      if (existingVisualizer) {
        existingVisualizer.remove();
      }
      
      if (index === currentSongIndex && isPlaying) {
        const visualizer = createAudioVisualizer();
        const songMeta = item.querySelector('.song-meta');
        songMeta.appendChild(visualizer);
      }
    });
  }

  // 每次播放状态改变时更新可视化效果
  const originalTogglePlay = togglePlay;
  togglePlay = function() {
    originalTogglePlay();
    updateVisualizer();
  };

  // 添加平滑滚动效果
  function smoothScrollToCurrentSong() {
    const currentSongItem = songItems[currentSongIndex];
    if (currentSongItem) {
      currentSongItem.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }

  // 每次切歌时滚动到当前歌曲
  const originalSwitchToSong = switchToSong;
  switchToSong = function(index) {
    originalSwitchToSong(index);
    smoothScrollToCurrentSong();
  };
});
</script>
