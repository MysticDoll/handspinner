(function() {
  "use strict";

  const Point = class Point {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    static fromMouseEvent(e) {
      if(e instanceof MouseEvent) {
        let {clientX, clientY} = e;
        return new Point(clientX, clientY);
      } else {
        throw new TypeError("argument is not a MouseEvent");
      }
    }

    static fromTouchEvent(e) {
      if(e instanceof TouchEvent) {
        let {clientX, clientY} = e.touches[0];
        return new Point(clientX, clientY);
      } else {
        throw new TypeError("argument is not a TouchEvent");
      }
    }

    static get center() {
      let {clientWidth, clientHeight} = document.documentElement;
      return new Point(clientWidth / 2, clientHeight / 2);
    }

    static distance(a, b) {
      if(a instanceof Point && b instanceof Point) {
      return ((a.x - b.x)**2 + (a.y - b.y)**2)**(1/2);
      } else {
        throw new TypeError("Point.distance requires 2 Point instaces");
      }
    }

    static getRadian(a, b) {
      let [prev, next] = 
        [a, b]
          .map(point => new Point(innerWidth - point.x - Point.center.x, innerHeight - point.y - Point.center.y));
      let i = prev.norm, j = next.norm;
      let sign = (prev.x * next.y - prev.y * next.x) > 0 ? 1 : -1;
      return sign * Math.acos((prev.x * next.x + prev.y * next.y)/(i * j)) / 10 || 0;
    }

    get norm() {
      return Point.distance(this, Point.center);
    }
  };
const MomentManager = class MomentManager {
    constructor(target) {
      this.accel = 0;
      this.target = target;
      setInterval(() => {
        let prevAccel = this.accel;
        this.addAccel(this.inertia);
        let [, rad] = /rotate\((\-?\d+(\.\d+)?)rad\)/.exec(target.style.transform) || [0, 0];
        this.accel = prevAccel * this.accel < 0 ? 0 : this.accel;
        target.style.transform = `rotate(${parseFloat(rad) + this.accel}rad)`;
      }, 3);
    }

    get inertia() {
      if(this.accel > 0) {
        return -1*(0.1)**(3);
      } else if(this.accel < 0) {
        return (0.1)**(3);
      } else {
        return 0;
      }
    }

    setRotate(rad) {
      let [, _rad] = /rotate\((\-?\d+(\.\d+)?)rad\)/.exec(this.target.style.transform) || [0, 0];
      this.target.style.transform = `rotate(${parseFloat(_rad) + rad}rad)`;
      this.addAccel(rad);
    }

    addAccel(a = 0) {
      this.accel += a;
    }
  };

  const manager = new MomentManager(document.querySelector("img"));
  let queue = [];

  if(/iPad|iPhone|iPod|Mobile|Android/.test(navigator.userAgent)) {
    window.addEventListener("touchstart", (e) => {
      if(!queue.length) {
        queue.push(Point.fromTouchEvent(e));
      } else {
        queue = [];
        queue.push(Point.fromTouchEvent(e));
      }
    });

    window.addEventListener("touchmove", (e) => {
      queue.push(Point.fromTouchEvent(e));
      manager.setRotate(Point.getRadian(...queue.slice(-2)));
    });
    window.addEventListener("touchend", (e) => {
      queue = [];
    });
  } else {
    window.addEventListener("mousedown", (e) => {
      if(!queue.length) {
        queue.push(Point.fromMouseEvent(e));
      } else {
        queue = [];
        queue.push(Point.fromMouseEvent(e));
      }
    });

    window.addEventListener("mousemove", (e) => {
      if(e.buttons === 1){ 
        queue.push(Point.fromMouseEvent(e));
        manager.setRotate(Point.getRadian(...queue.slice(-2)));
      }
    });
    window.addEventListener("mouseup", (e) => {
      queue.push(Point.fromMouseEvent(e));
      manager.setRotate(Point.getRadian(...queue.slice(-2)));
      queue = [];
    });
  }

})();


