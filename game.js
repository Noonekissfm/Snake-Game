const field = document.querySelector('.field');

const snake = {
    length: 1,
    direction: 1,
    body: [],
};

const game = {
    speed: 0.2,
    tickInterval: null,
    walls: {
        leftWall: [ 0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120, 132 ],
        rightWall: [ 11, 23, 35, 47, 59, 71, 83, 95, 107, 119, 131, 143 ],
    },
    score: {
        scoreBoard: document.querySelector('.score'),
        scoreCount: 0,
    },
};

/******************************
 *          ENGINE            *
 ******************************/

const launchEngine = () => {
    const gameTick = 1000 * game.speed;
    game.tickInterval = setInterval(() => {
        checkDirection(snake.direction)
        updateBodyPosition();
        checkCollision();
        drawSnake();
    }, gameTick);
};

const stopEngine = () => {
    clearInterval(game.tickInterval);
    return (game.tickInterval = null);
};

const directions = {
    LEFT: -1,
    RIGHT: 1,
    UP: -12,
    DOWN: 12,
};

window.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyA':
            return checkDirection(directions.LEFT);
        case 'KeyD':
            return checkDirection(directions.RIGHT);
        case 'KeyW':
            return checkDirection(directions.UP);
        case 'KeyS':
            return checkDirection(directions.DOWN);
        default:
            return null;
    }
});

const checkCollision = () => {
    const {previous, current} = snake.body[0].gameParams.position;

    if (current === game.foodIndex) {
        eatFood(snake.body[snake.body.length-1].gameParams.position.previous);
    }

    if (previous <= 11 && current < 0) {
        snake.body[0].remove();
        gameOver()
    }
    if (previous >= 132 && current > 143) {
        snake.body[0].remove();
        gameOver()
    }
    checkLeftWallCollision(previous, current);
    checkRightWallCollision(previous, current);
    checkSnakeCollision();
    
}

const checkLeftWallCollision = (previous, current) => {
    const wall = game.walls.leftWall

    for(let i = 0; i <= wall.length; i++) {
        if (previous === wall[i] && current === wall[i] - 1) {
            snake.body[0].remove();
            gameOver()
        }
    }
}
const checkRightWallCollision = (previous, current) => {
    const wall = game.walls.rightWall

    for(let i = 0; i <= wall.length; i++) {
        if (previous === wall[i] && current === wall[i] + 1) {
            snake.body[0].remove();
            gameOver()
        }
    }
}

const checkSnakeCollision = () => {
    const {current: headPosition} = snake.body[0].gameParams.position;

    for (let i = 1; i < snake.body.length; i++) {
        if(headPosition === snake.body[i].gameParams.position.current) {
            gameOver()
        }
    }
}

const checkDirection = (direction) => {
    const { previous, current } = snake.body[0].gameParams.position;
    console.log()

    return direction === (current - previous) * -1? null : snake.direction = direction;
}

const updateScore = (count) => {
    game.score.scoreCount += count;
    game.score.scoreBoard.innerText = game.score.scoreCount;
}

const gameOver = () => {
    return window.location.href = '/';
}

/******************************
 *          GAME MENU         *
 ******************************/

const createButton = (classList, innerText) => {
    const el = document.createElement('div');
    el.classList.add(...classList);
    el.innerText = innerText;
    return el;
};

const gameMenu = () => {
    const menu = document.querySelector('.menu');

    menu.addEventListener('click', (e)=>{
        e.stopPropagation();
        if (!e.target.classList.contains('buttons')) return

        return e.target.classList.toggle('active')
    })

    const start = createButton(['buttons', 'buttons-play'], 'PLAY');
    start.addEventListener('click', () => {

        document.querySelector('.buttons').style.transform = 'translateY(40px)';
        document.querySelector('.scoreBoard').style.transform = 'translateY(0px)';

        setTimeout(launchEngine, 500)
    });

    // const pause = createButton(['buttons', 'buttons-pause'], 'PAUSE');
    // pause.addEventListener('click', stopEngine);

    // const debug = createButton(['buttons', 'buttons-debug'], 'DEBUG');
    // debug.addEventListener('click', () => {
    //     document.querySelector('html').classList.toggle('debug')
    // });

    menu.appendChild(start);
    // menu.appendChild(pause);
    // menu.appendChild(debug);
};

/******************************
 *          SNAKE             *
 ******************************/

const createHead = (position) => {
    const snakeHead = document.createElement('div');
    snakeHead.classList.add('head');
    snake.body[0] = snakeHead;
    snakeHead.gameParams = {
        position: {
            previous: null,
            current: position,
        },
    };

    return snakeHead;
};

const updateBodyPosition = () => {
    snake.body[0].gameParams.position.previous = snake.body[0].gameParams.position.current
    snake.body[0].gameParams.position.current += snake.direction;

    if (snake.body.length < 2) return
    
    for(let i = 1; i <= snake.body.length-1; i++) {
        snake.body[i].gameParams.position.previous = snake.body[i].gameParams.position.current
        snake.body[i].gameParams.position.current = snake.body[i-1].gameParams.position.previous;
    }
}

const createBody = (position) => {
    let classes = ['body', 'tail'];
    const snakeBody = document.createElement('div');
    if (snake.body.length % 2 !== 0) {
        classes.push('colored')
    }
    snakeBody.classList.add(...classes);
    snakeBody.gameParams = {
        position: {
            previous: null,
            current: position,
        },
    };

    snake.body.push(snakeBody);
    return snakeBody
};

const eatFood = (position) => {
    updateScore(100);
    if (snake.body.length > 1) {
        const el = document.querySelector('.tail');
        el.classList.remove('tail')
    }
    document.querySelector('.food').remove();
    snake.body[0].remove();

    createBody(position)
    placeFood(createFood());
};

const drawSnake = () => {

    for(let i = 0; i <= snake.body.length-1; i++) {
        snake.body[i].remove()
        document.querySelector(`.field_cell[index="${snake.body[i].gameParams.position.current}"]`).appendChild(snake.body[i]);
    }

};

/******************************
 *          FIELD             *
 ******************************/

const createField = () => {
    const startPosition = 0;
    for (let i = 0; i < 144; i++) {
        const field_cell = document.createElement('div');
        field_cell.setAttribute('index', i);
        field_cell.innerHTML = `<p class="cell_index">${i}</p>`;
        field_cell.classList.add('field_cell');
        field.appendChild(field_cell);
        if (i === startPosition) {
            field_cell.appendChild(createHead(startPosition));
        }
    }
    return;
};

/******************************
 *          Food             *
 ******************************/

const createFood = () => {
    const food = document.createElement('div');
    food.classList.add('food');
    return food;
};

const placeFood = (food) => {
    const cells = document.querySelectorAll('.field_cell');
    let number = Math.floor(Math.random() * cells.length);
    

    for (let i = 0; i < snake.body.length; i++) {
        if (snake.body[i].gameParams.position.current === number) {
            return placeFood(createFood());
        }
    }

    let place = cells[number];
    place.appendChild(food);
    game.foodIndex = getFoodIndex();
};

const getFoodIndex = () => {
    return Number(document.querySelector('.food').parentElement.getAttribute('index'));
};

/******************************
 *          ******            *
 ******************************/

 gameMenu();
 createField();
 placeFood(createFood());
 updateScore(0);
