import express from 'express';
const router = express.Router();
import auth from '../midddleware/auth.middleware.js';
import {createDisaster,getDisasters,updateDisaster,deleteDisaster, geography, verifyImage} from '../controller/disaster.controller.js';
import { getSocialMediaPosts,getOfficialUpdates, getOfficialUpdatesNoCache } from '../controller/social.js';  

router.post('/createDisaster', auth('contributor'), (req, res) => {
  createDisaster(req, res, req.app.get('io'));
});

router.get('/getDisasters', getDisasters);
router.put('/update/:id', auth('admin'), updateDisaster);
router.delete('/delete/:id', auth('admin'), deleteDisaster);
router.get('/social-media/:id', getSocialMediaPosts);
router.get('/resources/:id', geography);
router.get('/official-updates/:id', getOfficialUpdates);
router.get('/disaster/official-updates-no-cache/:id', getOfficialUpdatesNoCache);

router.post('/verify-image/:id', auth('contributor'), verifyImage);


export default router;