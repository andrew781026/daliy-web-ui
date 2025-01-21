class HoverDragCircle extends HTMLElement {

  html = `
    <div class="cursor-point">DRAG</div>
  `;

  style = `
   <style>
      .cursor-point.active {
            height: 100px;
            width: 100px;
            opacity: 1;
      }

      .cursor-point {
          left: 0;
          top: 0;
          height: 1px;
          width: 1px;
          border-radius: 50%;
          position: fixed;
          transition: opacity 0.3s ease, height 0.3s, width 0.3s;
          transform: translate(-50%,-50%);
          background-color: rgba(18,19,25,.6);
          backdrop-filter: blur(7px);
          pointer-events: none;
          opacity: 0;
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 1.2rem;
      }
   </style>
  `

  getStyle() {
    const div = document.createElement("div");
    div.innerHTML = this.style;
    return div.children[0];
  }

  constructor() {
    super();

    // open shadow dom
    const shadow = this.attachShadow({mode: "open"});

    // set html
    shadow.innerHTML = this.html;

    // append styling
    this.shadowRoot.appendChild(this.getStyle());

    // actions
    document.body.addEventListener('mousemove', e => {

      shadow.querySelector('.cursor-point').style.left = `${e.clientX}px`;
      shadow.querySelector('.cursor-point').style.top = `${e.clientY}px`;
    });

  }

  // dom mounted
  connectedCallback() {

    setTimeout(() => {

      const container = document.querySelector(this.getAttribute("data-container-id"));
      container?.addEventListener('mouseenter', () => {
        container.style.cursor = "none";
        this.shadowRoot.querySelector('.cursor-point').classList.add('active');
      });

      container?.addEventListener('mouseleave', () => {
        this.shadowRoot.querySelector('.cursor-point').classList.remove('active');
      });
    },1000)
  }
}

window.customElements.define("hover-drag-circle", HoverDragCircle);
