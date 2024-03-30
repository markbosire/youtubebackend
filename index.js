const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");


const app = express();


// Set up middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://markbosirekenyariri:09kumamoto.@cluster0.g3nicnh.mongodb.net/infobot_db?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));

// Define the schema
const categorySchema = new mongoose.Schema({
  categoryName: String,
  channels: {
    type: Map,
    of: [String]
  }
});

const Category = mongoose.model('Category', categorySchema);

// Create a new category
app.post('/categories', async (req, res) => {
  const { categoryName, channels } = req.body;
  const category = new Category({ categoryName, channels });
  try {
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all categories
app.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new channel to a category
app.put('/categories/:categoryName/channels/:channelName', async (req, res) => {
  const { categoryName, channelName } = req.params;
  try {
    const category = await Category.findOne({ categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    category.channels.set(channelName, []);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Add a video URL to a channel
app.put('/categories/:categoryName/channels/:channelName/videos', async (req, res) => {
  const { categoryName, channelName } = req.params;
  const { videoUrl } = req.body;
  try {
    const category = await Category.findOne({ categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const channelVideos = category.channels.get(channelName) || [];
    channelVideos.push(videoUrl);
    category.channels.set(channelName, channelVideos);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a category
app.delete('/categories/:categoryName', async (req, res) => {
  const { categoryName } = req.params;
  try {
    const category = await Category.findOneAndDelete({ categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json({ message: 'Category removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a channel from a category
app.delete('/categories/:categoryName/channels/:channelName', async (req, res) => {
  const { categoryName, channelName } = req.params;
  try {
    const category = await Category.findOne({ categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    category.channels.delete(channelName);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Remove a video URL from a channel
app.delete('/categories/:categoryName/channels/:channelName/videos/:videoUrl', async (req, res) => {
  const { categoryName, channelName, videoUrl } = req.params;
  try {
    const category = await Category.findOne({ categoryName });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    const channelVideos = category.channels.get(channelName) || [];
    const updatedVideos = channelVideos.filter(url => url !== videoUrl);
    category.channels.set(channelName, updatedVideos);
    await category.save();
    res.json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
