import express from 'express';
const router = express.Router();
import auth from '../midddleware/auth.middleware.js';
import {createDisaster,getDisasters,updateDisaster,deleteDisaster, geography, verifyImage} from '../controller/disaster.controller.js';
import { getSocialMediaPosts,getOfficialUpdates } from '../controller/social.js';  

router.post('/createDisaster', auth('contributor'), (req, res) => {
  createDisaster(req, res, req.app.get('io'));
});

router.get('/getDisasters', getDisasters);
router.put('/update/:id', auth('admin'), updateDisaster);
router.delete('/delete/:id', auth('admin'), deleteDisaster);
router.get('/:id/social-media', getSocialMediaPosts);
router.get('/:id/resources', geography);
router.get('/:id/official-updates', getOfficialUpdates);

router.post('/:id/verify-image', auth('contributor'), verifyImage);


export default router;