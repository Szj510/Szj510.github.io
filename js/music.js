// Aceternity UI 风格的音乐轮播
document.addEventListener('DOMContentLoaded', function() {
  const carousel = document.querySelector('.artist-carousel');
  const cards = document.querySelectorAll('.artist-card');
  
  if (!carousel || cards.length === 0) {
    console.warn('Music carousel elements not found');
    return;
  }

  let currentIndex = 0;
  let autoRotateInterval;
  
  // 初始化轮播
  function initCarousel() {
    cards.forEach((card, index) => {
      card.style.transform = `translateX(${(index - currentIndex) * 320}px) scale(${index === currentIndex ? 1 : 0.8})`;
      card.style.opacity = index === currentIndex ? '1' : '0.6';
      card.style.zIndex = index === currentIndex ? '10' : '1';
    });
  }

  // 更新轮播位置
  function updateCarousel() {
    cards.forEach((card, index) => {
      const offset = index - currentIndex;
      const translateX = offset * 320;
      const scale = index === currentIndex ? 1 : 0.8;
      const opacity = index === currentIndex ? 1 : 0.6;
      const rotateY = Math.abs(offset) > 0 ? offset * 15 : 0;
      
      card.style.transform = `translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`;
      card.style.opacity = opacity;
      card.style.zIndex = index === currentIndex ? 10 : 1;
      
      // 活跃卡片添加特殊效果
      if (index === currentIndex) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  // 下一张
  function nextSlide() {
    currentIndex = (currentIndex + 1) % cards.length;
    updateCarousel();
  }

  // 上一张
  function prevSlide() {
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    updateCarousel();
  }

  // 跳转到指定索引
  function goToSlide(index) {
    if (index >= 0 && index < cards.length) {
      currentIndex = index;
      updateCarousel();
    }
  }

  // 自动轮播
  function startAutoRotate() {
    autoRotateInterval = setInterval(nextSlide, 4000);
  }

  function stopAutoRotate() {
    clearInterval(autoRotateInterval);
  }

  // 鼠标事件处理
  cards.forEach((card, index) => {
    // 点击切换
    card.addEventListener('click', () => {
      if (index === currentIndex) {
        // 如果点击的是当前活跃卡片，切换歌曲列表显示
        const songList = card.querySelector('.song-list');
        if (songList) {
          songList.classList.toggle('show');
        }
      } else {
        // 否则切换到该卡片
        goToSlide(index);
      }
    });

    // 鼠标进入停止自动轮播
    card.addEventListener('mouseenter', () => {
      stopAutoRotate();
      // 添加3D效果
      card.style.transition = 'transform 0.3s ease';
    });

    // 鼠标离开继续自动轮播
    card.addEventListener('mouseleave', () => {
      startAutoRotate();
      card.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    });

    // 鼠标移动3D效果
    card.addEventListener('mousemove', (e) => {
      if (index !== currentIndex) return;
      
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const rotateX = (e.clientY - centerY) / 10;
      const rotateY = (centerX - e.clientX) / 10;
      
      const offset = index - currentIndex;
      const translateX = offset * 320;
      const scale = 1;
      
      card.style.transform = `translateX(${translateX}px) scale(${scale}) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
  });

  // 键盘控制
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stopAutoRotate();
      prevSlide();
      setTimeout(startAutoRotate, 1000);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stopAutoRotate();
      nextSlide();
      setTimeout(startAutoRotate, 1000);
    }
  });

  // 初始化
  initCarousel();
  startAutoRotate();

  // 添加控制按钮（如果需要）
  function createControls() {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'carousel-controls';
    
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '‹';
    prevBtn.className = 'carousel-btn carousel-prev';
    prevBtn.addEventListener('click', () => {
      stopAutoRotate();
      prevSlide();
      setTimeout(startAutoRotate, 2000);
    });
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '›';
    nextBtn.className = 'carousel-btn carousel-next';
    nextBtn.addEventListener('click', () => {
      stopAutoRotate();
      nextSlide();
      setTimeout(startAutoRotate, 2000);
    });
    
    controlsContainer.appendChild(prevBtn);
    controlsContainer.appendChild(nextBtn);
    
    const wrapper = document.querySelector('.artist-carousel-wrapper');
    if (wrapper) {
      wrapper.appendChild(controlsContainer);
    }
  }

  // 可选：创建控制按钮
  // createControls();
});