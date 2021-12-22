// 전역변수는 피하자
//default - scrollHeight = 4875
(function(){

  let yOffset = 0; // window.pageYOffset 대신 쓸 변수
  let prevScrollHeight = 0; // 현재 스크롤 위치(yOffset)보다 이전에 위치한 스크롤 섹션들의 스크롤 높이값의 합
  let currentScene = 0; //현재 활성화된(눈앞에 보고있는) 씬(scroll-section)
  let enterNewScene = false; // 새로운 scene이 시작된 순간 true
  
  const sceneInfo = [
    {
      //0
      type: 'sticky',
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
      scrollHeight: 0,
      objects: {
        container: document.querySelector('#scroll-section-0'),
        messageA: document.querySelector('#scroll-section-0 .main-message.a'),
        messageB: document.querySelector('#scroll-section-0 .main-message.b'),
        messageC: document.querySelector('#scroll-section-0 .main-message.c'),
        messageD: document.querySelector('#scroll-section-0 .main-message.d'),
        canvas: document.querySelector('#video-canvas-0'),
        context: document.querySelector('#video-canvas-0').getContext('2d'),
        videoImages: []
      },
      values: {
        videoImagesCount: 125,
        imageSequence: [0, 124],
        canvas_opacity_in: [0, 1, { start: 0, end: 0.05}],
        canvas_opacity_out: [1, 0, { start: 0.9, end: 0.95}],
        // A
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2}],
        messageA_opacity_out: [1, 0, { start: 0.25, end: 0.3}],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2}],
        messageA_translateY_out: [0, -20, { start: 0.25, end: 0.3}],
        // B
        messageB_opacity_in: [0, 1, { start: 0.3, end: 0.4}],
        messageB_opacity_out: [1, 0, { start: 0.45, end: 0.5}],
        messageB_translateY_in: [20, 0, { start: 0.3, end: 0.4}],
        messageB_translateY_out: [0, -20, { start: 0.45, end: 0.5 }],
        // C
        messageC_opacity_in: [0, 1, { start: 0.5, end: 0.6}],
        messageC_translateY_in: [20, 0, { start: 0.5, end: 0.6}],
        messageC_opacity_out: [1, 0, { start: 0.65, end: 0.7 }],
        messageC_translateY_out: [0, -20, { start: 0.65, end: 0.7}],
        // D
        messageD_opacity_in: [0, 1, { start: 0.7, end: 0.8}],
        messageD_translateY_in: [20, 0, { start: 0.7, end: 0.8}],
        messageD_opacity_out: [1, 0, { start: 0.85, end: 0.9}],
        messageD_translateY_out: [0, -20, { start: 0.85, end: 0.9}]

      }
    },
    {
      //1
      type: 'normal',
      // heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅 // type normal에서는 필요 없음
      scrollHeight: 0,
      objects: {
        container: document.querySelector('#scroll-section-1')
      }
    },
    {
      //2
      type: 'sticky',
      heightNum: 2, //브라우저 높이의 5배로 scrollHeight 세팅
      scrollHeight: 0,
      objects: {
        container: document.querySelector('#scroll-section-2'),
        messageA: document.querySelector('#scroll-section-2 .a'),
      },
      values: {
        // A
        messageA_opacity_in: [0, 1, { start: 0.1, end: 0.2 }],
        messageA_opacity_out: [1, 0, { start: 0.6, end: 0.7 }],
        messageA_translateY_in: [20, 0, { start: 0.1, end: 0.2 }],
        messageA_translateY_out: [0, -20, { start: 0.6, end: 0.7 }],
      }
    },
    {
      //3
      type: 'normal',
      heightNum: 5, //브라우저 높이의 5배로 scrollHeight 세팅
      scrollHeight: 0,
      objects: {
        container: document.querySelector('#scroll-section-3')
      }
    },
  ];

  function setCanvasImages() {
    let imgElem;
    for (let i = 0; i < sceneInfo[0].values.videoImagesCount; i++) {
      imgElem = new Image();
      imgElem.src = `./video/introduce/${1 + i}.jpg`;
      sceneInfo[0].objects.videoImages.push(imgElem);
    }
  }
  setCanvasImages();

  function setLayout() {
    //각 스크롤 섹션의 높이 세팅
    for (let i = 0; i < sceneInfo.length; i++) {
      if (sceneInfo[i].type === 'sticky') {
        sceneInfo[i].scrollHeight = sceneInfo[i].heightNum * window.innerHeight;
      } else if (sceneInfo[i].type === 'normal') {
        sceneInfo[i].scrollHeight = sceneInfo[i].objects.container.offsetHeight;
      }
        sceneInfo[i].objects.container.style.height = `${sceneInfo[i].scrollHeight}px`
    }

    yOffset = window.pageYOffset;

    let totalScrollHeight = 0;
    for (let i = 0; i < sceneInfo.length; i++) {
      totalScrollHeight += sceneInfo[i].scrollHeight;
      if (totalScrollHeight >= yOffset) {
        currentScene = i;
        break;
      }
    }
    document.body.setAttribute('id',`show-scene-${currentScene}`);

    const heightRatio = window.innerHeight / 1080;
    sceneInfo[0].objects.canvas.style.transform = `translate3d(-50%, -50%, 0) scale(${heightRatio})`;
  }

  function calcValues(values, currentYOffset) {
    let rv;
    //현재 씬(스크롤 섹션)에서 스크롤된 범위를 비율로 구하기
    const scrollHeight = sceneInfo[currentScene].scrollHeight
    const scrollRatio = currentYOffset / scrollHeight;

    if (values.length === 3) {
      // start ~ end 사이에 애니메이션 실행
      const partScrollStart = values[2].start * scrollHeight;
      const partScrollEnd = values[2].end * scrollHeight;
      const partScrollHeight = partScrollEnd - partScrollStart;

      if (currentYOffset >= partScrollStart && currentYOffset <= partScrollEnd) {
        rv=  (currentYOffset - partScrollStart) / partScrollHeight * (values[1] - values[0]) + values[0];
      } else if (currentYOffset < partScrollStart) {
        rv= values[0];
      } else if (currentYOffset > partScrollEnd) {
        rv = values[1];
      }
    } else {
      rv= scrollRatio * (values[1] - values[0]) + values[0];
    }

    return rv;
  }

  function playAnimation() {
    const objects = sceneInfo[currentScene].objects;
    const values = sceneInfo[currentScene].values;
    const currentYOffset = yOffset - prevScrollHeight; //현재 씬에서 스크롤된 높이
    const scrollHeight = sceneInfo[currentScene].scrollHeight;
    const scrollRatio = currentYOffset / scrollHeight;


    switch (currentScene) {
      case 0:
        // const messageA_opacity_in = calcValues(values.messageA_opacity_in, currentYOffset);
        // const messageA_opacity_out = calcValues(values.messageA_opacity_out, currentYOffset);
        // const messageA_translateY_in = calcValues(values.messageA_translateY_in, currentYOffset);
        // const messageA_translateY_out = calcValues(values.messageA_translateY_out, currentYOffset);
        let sequence = Math.round(calcValues(values.imageSequence, currentYOffset));
        objects.context.drawImage(objects.videoImages[sequence], 0, 0);

// 
        if (scrollRatio <= 0.5) {
          //in
          objects.canvas.style.opacity = calcValues(values.canvas_opacity_in, currentYOffset);
        } else {
          //out
          objects.canvas.style.opacity = calcValues(values.canvas_opacity_out, currentYOffset);
        }
// 

        if (scrollRatio <= 0.22) {
          //in
          objects.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
          objects.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
        } else {
          //out
          objects.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
          objects.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.42) {
          // in
          objects.messageB.style.opacity = calcValues(values.messageB_opacity_in, currentYOffset);
          objects.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objects.messageB.style.opacity = calcValues(values.messageB_opacity_out, currentYOffset);
          objects.messageB.style.transform = `translate3d(0, ${calcValues(values.messageB_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.62) {
          // in
          objects.messageC.style.opacity = calcValues(values.messageC_opacity_in, currentYOffset);
          objects.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objects.messageC.style.opacity = calcValues(values.messageC_opacity_out, currentYOffset);
          objects.messageC.style.transform = `translate3d(0, ${calcValues(values.messageC_translateY_out, currentYOffset)}%, 0)`;
        }

        if (scrollRatio <= 0.82) {
          // in
          objects.messageD.style.opacity = calcValues(values.messageD_opacity_in, currentYOffset);
          objects.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objects.messageD.style.opacity = calcValues(values.messageD_opacity_out, currentYOffset);
          objects.messageD.style.transform = `translate3d(0, ${calcValues(values.messageD_translateY_out, currentYOffset)}%, 0)`;
        }
        break;

      case 2:

        if (scrollRatio <= 0.25) {
          // in
          objects.messageA.style.opacity = calcValues(values.messageA_opacity_in, currentYOffset);
          objects.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_in, currentYOffset)}%, 0)`;
        } else {
          // out
          objects.messageA.style.opacity = calcValues(values.messageA_opacity_out, currentYOffset);
          objects.messageA.style.transform = `translate3d(0, ${calcValues(values.messageA_translateY_out, currentYOffset)}%, 0)`;
        }
        break;

    }
  }

  function scrollLoop() {
    enterNewScene = false;
    prevScrollHeight = 0;
    for (let i = 0; i < currentScene; i++){
      prevScrollHeight += sceneInfo[i].scrollHeight;
    }

    if(yOffset > prevScrollHeight + sceneInfo[currentScene].scrollHeight) {
      enterNewScene = true;
      currentScene++;
      document.body.setAttribute('id',`show-scene-${currentScene}`);
    }
    if (yOffset < prevScrollHeight) {
      enterNewScene = true; //스크롤 시 마이너스를 막아줌
      if (currentScene === 0) return; //브라우저 바운스 효과로 인해 마이너스가 되는 것을 방지(모바일)
      currentScene--;
      document.body.setAttribute('id',`show-scene-${currentScene}`);
    }

    if (enterNewScene) return;

    playAnimation();
  }

  window.addEventListener('scroll', () => {
    yOffset = window.pageYOffset;
    scrollLoop();
  });
  // window.addEventListener('DOMcontentLoaded',setLayout);
  window.addEventListener('load', () => {
    setLayout();
    sceneInfo[0].objects.context.drawImage(sceneInfo[0].objects.videoImages[0], 0, 0);
  });
  window.addEventListener('resize', setLayout);
  setLayout();

  
})();