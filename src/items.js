import { Router } from 'express';
const itemsRouter = Router();

itemsRouter.route('/items').get((req, res) => {
  console.log('/items 호출됨');

  if (req.session.user) {
    res.redirect('/public/items.html');
  } else {
    res.redirect('/public/login.html');
  }
});

export { itemsRouter };
