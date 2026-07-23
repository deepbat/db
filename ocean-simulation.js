(function() {
    'use strict';

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.getElementById('oceanCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var width, height;
    var terrain = [];
    var ripples = [];
    var isLongPress = false;
    var longPressTimer = null;
    var mouseX = 0, mouseY = 0;
    var sculptMode = 'dig';
    var TERRAIN_SCALE = 6;
    var LONG_PRESS_DURATION = 300;
    var animFrameId = null;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initTerrain();
    }

    function initTerrain() {
        var cols = Math.ceil(width / TERRAIN_SCALE) + 1;
        var rows = Math.ceil(height / TERRAIN_SCALE) + 1;
        terrain = [];
        for (var y = 0; y < rows; y++) {
            terrain[y] = [];
            for (var x = 0; x < cols; x++) {
                terrain[y][x] = {
                    height: Math.random() * 4 - 2,
                    originalHeight: Math.random() * 4 - 2
                };
            }
        }
    }

    function getScaledX(x) {
        return Math.floor(x / TERRAIN_SCALE);
    }

    function getScaledY(y) {
        return Math.floor(y / TERRAIN_SCALE);
    }

    function sculptTerrain(cx, cy, radius, amount) {
        var startX = Math.max(0, getScaledX(cx - radius));
        var endX = Math.min(terrain[0].length - 1, getScaledX(cx + radius));
        var startY = Math.max(0, getScaledY(cy - radius));
        var endY = Math.min(terrain.length - 1, getScaledY(cy + radius));

        for (var y = startY; y <= endY; y++) {
            for (var x = startX; x <= endX; x++) {
                var dx = (x * TERRAIN_SCALE + TERRAIN_SCALE / 2 - cx);
                var dy = (y * TERRAIN_SCALE + TERRAIN_SCALE / 2 - cy);
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < radius) {
                    var factor = 1 - (dist / radius);
                    terrain[y][x].height += amount * factor * factor;
                }
            }
        }
    }

    function createRipple(x, y) {
        ripples.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 150 + Math.random() * 100,
            speed: 2,
            birthTime: Date.now()
        });
    }

    function updateRipples() {
        for (var i = ripples.length - 1; i >= 0; i--) {
            var ripple = ripples[i];
            ripple.radius += ripple.speed;
            if (ripple.radius > ripple.maxRadius) {
                ripples.splice(i, 1);
            }
        }
    }

    function getTerrainHeightAt(x, y) {
        var tx = getScaledX(x);
        var ty = getScaledY(y);
        if (tx < 0 || tx >= terrain[0].length - 1 || ty < 0 || ty >= terrain.length - 1) {
            return 0;
        }
        var fx = (x % TERRAIN_SCALE) / TERRAIN_SCALE;
        var fy = (y % TERRAIN_SCALE) / TERRAIN_SCALE;
        var h00 = terrain[ty][tx].height;
        var h10 = terrain[ty][tx + 1].height;
        var h01 = terrain[ty + 1][tx].height;
        var h11 = terrain[ty + 1][tx + 1].height;
        var h0 = h00 * (1 - fx) + h10 * fx;
        var h1 = h01 * (1 - fx) + h11 * fx;
        return h0 * (1 - fy) + h1 * fy;
    }

    function getTerrainGradientAt(x, y) {
        var epsilon = TERRAIN_SCALE;
        var hLeft = getTerrainHeightAt(x - epsilon, y);
        var hRight = getTerrainHeightAt(x + epsilon, y);
        var hTop = getTerrainHeightAt(x, y - epsilon);
        var hBottom = getTerrainHeightAt(x, y + epsilon);
        return {
            dx: (hRight - hLeft) / (2 * epsilon),
            dy: (hBottom - hTop) / (2 * epsilon)
        };
    }

    function drawTerrain() {
        for (var y = 0; y < terrain.length; y++) {
            for (var x = 0; x < terrain[y].length; x++) {
                var h = terrain[y][x].height;
                var normalizedHeight = (h + 5) / 10;
                var r = Math.floor(5 + normalizedHeight * 20);
                var g = Math.floor(20 + normalizedHeight * 50);
                var b = Math.floor(60 + normalizedHeight * 100);
                ctx.fillStyle = 'rgb(' + r + ', ' + g + ', ' + b + ')';
                ctx.fillRect(x * TERRAIN_SCALE, y * TERRAIN_SCALE, TERRAIN_SCALE, TERRAIN_SCALE);
            }
        }
    }

    function drawRipples() {
        for (var i = 0; i < ripples.length; i++) {
            var ripple = ripples[i];
            var opacity = Math.max(0, 1 - ripple.radius / ripple.maxRadius);
            ctx.strokeStyle = 'rgba(100, 180, 255, ' + (opacity * 0.4) + ')';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    function applyRippleEffects() {
        for (var i = 0; i < ripples.length; i++) {
            var ripple = ripples[i];
            var gradient = getTerrainGradientAt(ripple.x, ripple.y);
            if (Math.abs(gradient.dx) > 0.01 || Math.abs(gradient.dy) > 0.01) {
                ripple.speed = 2 + Math.abs(gradient.dx + gradient.dy) * 5;
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        updateRipples();
        applyRippleEffects();
        drawTerrain();
        drawRipples();
        animFrameId = requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (!animFrameId) {
            animate();
        }
    }

    canvas.addEventListener('mousedown', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        longPressTimer = setTimeout(function() {
            isLongPress = true;
            sculptMode = 'dig';
        }, LONG_PRESS_DURATION);
    });

    canvas.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (isLongPress) {
            sculptTerrain(mouseX, mouseY, 50, sculptMode === 'dig' ? -0.6 : 0.6);
        }
    });

    canvas.addEventListener('mouseup', function(e) {
        clearTimeout(longPressTimer);
        if (!isLongPress) {
            createRipple(e.clientX, e.clientY);
            startAnimation();
        }
        isLongPress = false;
        longPressTimer = null;
    });

    canvas.addEventListener('mouseleave', function() {
        clearTimeout(longPressTimer);
        isLongPress = false;
        longPressTimer = null;
    });

    canvas.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        sculptMode = sculptMode === 'dig' ? 'raise' : 'dig';
    });

    canvas.addEventListener('touchstart', function(e) {
        var touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        longPressTimer = setTimeout(function() {
            isLongPress = true;
            sculptMode = 'dig';
        }, LONG_PRESS_DURATION);
    }, { passive: true });

    canvas.addEventListener('touchmove', function(e) {
        var touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        if (isLongPress) {
            sculptTerrain(mouseX, mouseY, 50, sculptMode === 'dig' ? -0.6 : 0.6);
        }
    }, { passive: true });

    canvas.addEventListener('touchend', function(e) {
        clearTimeout(longPressTimer);
        if (!isLongPress) {
            var touch = e.changedTouches[0];
            createRipple(touch.clientX, touch.clientY);
            startAnimation();
        }
        isLongPress = false;
        longPressTimer = null;
    });

    window.addEventListener('resize', function() {
        resize();
    });

    resize();

})();
