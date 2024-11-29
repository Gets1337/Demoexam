const express = require('express');
const app = express();
const jsonInterpr = express.json();
const cors = require('cors');

app.use(cors());

class Order {
    number;
    date;
    device;
    model;
    problemType;
    surname;
    name;
    patronymic;
    numberPhone;
    status;
    master;
    workStatus;
    stage;
    comment;
    startTime;
    endTime;
    constructor(
    number,
    date,
    device,
    model,
    problemType,
    surname,
    name,
    patronymic,
    numberPhone,
    status,
    master,
    workStatus,
    stage,
    comment,
    startTime,
    endTime,
    ) {
        this.number = number;
        this.date = date;
        this.device = device;
        this.model = model;
        this.problemType = problemType;
        this.surname = surname;
        this.name = name;
        this.patronymic = patronymic;
        this.numberPhone = numberPhone;
        this.status = status;
        this.master = master;
        this.workStatus = workStatus;
        this.stage = stage;
        this.comment = comment;
        this.startTime = startTime;
        this.endTime = endTime;
    }
}

let repo = [
    new Order (
        1,
        new Date('2023-06-06'),
        'Компютер',
        'DEXP Aquilon O286',
        'Перестал работать',
        'Лобок',
        'Даниил',
        'Андреевич',
        79655240234,
        'В процессе ремонта',
        'Суровцев',
        'завершено',
        '',
        'пусто',
        '',
    )
];

let isUpdateStatus = false;
let massage = '';
let massage2 = '';

app.post('/', jsonInterpr, (req, res) => {
    // Добавление новой заявки
    let buffer = req.body;
    repo.push(buffer);
    res.send(buffer);
});

app.get('/', (req, res) => {
    // Получение всех заявок
    res.send(repo);
});

app.put('/:num', jsonInterpr, (req, res) => {
    // Обновление заявки
    const num = req.params.num;
    let buffer = req.body;
    const index = repo.findIndex((item) => item.number == num);
    const ord = repo[index];
    if (!buffer) res.sendStatus(404);
    for (let i = 0; i < repo.length; i++) {
      if (repo[i].number == num) {
        index = i;
        const ord = repo[i];
        if (ord.stage != buffer.stage) {
          ord.stage = buffer.stage;
          isUpdateStatus = true;
          massage += 'Статус заявки номер' + ord.number + 'изменён \n';
        }
        if (buffer.problemType !== undefined) {
            ord.problemType = buffer.problemType;
          }
          if (buffer.master !== undefined) {
            ord.master = buffer.master;
          }
          if (buffer.status !== undefined) {
            ord.status = buffer.status;
          }
      }
    }
    res.send(ord);
  });

  app.get('/:num', (req, res) => {
    // Поиск по номеру заявки
    let num = req.params.num;
    for (let i = 0; i < repo.length; i++)
      if (repo[i].number == num) {
        res.send(repo[i]);
        return;
      }
    res.send('не найдено');
  });
  
  app.get('/filter/:param', (req, res) => {
    // Поиск по параметрам
    let param = req.params.param;
    let result = [];
    for (let i = 0; i < repo.length; i++)
      if (
        repo[i].surname == param ||
        repo[i].name == param ||
        repo[i].patronymic == param ||
        repo[i].phone == param ||
        repo[i].device == device ||
        repo[i].model == model 
      ) {
        result.push(repo[i]);
      }
    res.send(result);
  });

  app.put('/comment/:num', jsonInterpr, (req, res) => {
    // Добавление комментария по номеру 
    const num = req.params.num;
    const comment = req.body;
    const index = repo.findIndex((repo) => repo.number == num);
    if (index === -1) {
      return res.sendStatus(404);
    }
    repo[index].comment = comment;
    res.send(repo[index]);
  });

  app.put('/status/:num', jsonInterpr, (req, res) => {
    // Изменение статуса
    const num = parseInt(req.params.num, 10);
    const { workStatus } = req.body;
  
    const index = repo.findIndex((repo) => repo.number === num);
  
    if (index === -1) {
      return res.send('Заявка не найдена');
    }
  
    const ord = repo[index];
    ord.workStatus = workStatus;
  
    if (workStatus === 'завершено' && !ord.endTime) {
      ord.endTime = new Date().toISOString(); 
      massage2.push(`Заявка номер ${ord.number} завершена.`);
    }
  
    res.send(repo[index]);
  });
  
  app.get('/completed/count', (req, res) => {
    // Количество выполненных заявок
    const completedCount = repo.filter(
      (repo) => repo.workStatus === 'завершено'
    ).length;
    res.send({ completedCount });
  });
  
  app.get('/stats/problem-types', (req, res) => {
    // Статистика по типам неисправностей
    const stats = repo.reduce((acc, repo) => {
      acc[repo.problemType] = (acc[repo.problemType] || 0) + 1;
      return acc;
    }, {});
  
    res.send(stats);
  });

  app.get('/average-completion-time', (req, res) => {
    // Среднее время выполнения заявки
    let totalTime = 0;
    let completedCount = 0;
  
    repo.forEach((item) => {
      if (item.startTime && item.endTime && item.workStatus === 'завершено') {
        const start = new Date(item.startTime);
        const end = new Date(item.endTime);
        const timeDiff = end - start; 
  
        if (timeDiff > 0) {
          totalTime += timeDiff;
          completedCount++;
        }
      }
    });
  
    if (completedCount === 0) {
      return res.send({ message: "Нет завершенных заявок для расчета" });
    }
  
    const averageTime = totalTime / completedCount; 
    const averageHours = (averageTime / (1000 * 60 * 60)).toFixed(2); 
  
    res.send({ averageCompletionTime: {averageHours}});
  });

  app.delete('/:num', (req, res) => {
    // Удаление пользователя
    const num = parseInt(req.params.num, 10);
    const index = repo.findIndex((entry) => entry.number === num);
  
    if (index === -1) {
      return res.status(404).send('Заявка не найдена');
    }
  
    repo.splice(index, 1);
    res.send('Заявка удалена');
  });
  
app.listen(3000);
