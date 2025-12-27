const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const Scholarship = require('../models/Scholarship');

// GET all scholarships (Public - không cần auth)
router.get('/', async (req, res) => {
  try {
    const scholarships = await Scholarship.find()
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    
    res.json({ 
      success: true, 
      data: scholarships,
      count: scholarships.length 
    });
  } catch (error) {
    console.error('Error fetching scholarships:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách học bổng',
      error: error.message 
    });
  }
});

// GET scholarship by ID
router.get('/:id', async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id);
    
    if (!scholarship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy học bổng' 
      });
    }
    
    res.json({ 
      success: true, 
      data: scholarship 
    });
  } catch (error) {
    console.error('Error fetching scholarship:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy thông tin học bổng',
      error: error.message 
    });
  }
});

// POST create scholarship (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Chỉ admin mới có thể tạo học bổng' 
      });
    }

    const { name, content, expiryDate } = req.body;

    // Validation
    if (!name || !content || !expiryDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin học bổng' 
      });
    }

    const scholarship = new Scholarship({
      name,
      content,
      expiryDate
    });

    await scholarship.save();

    res.status(201).json({ 
      success: true, 
      data: scholarship,
      message: 'Đã tạo học bổng thành công' 
    });
  } catch (error) {
    console.error('Error creating scholarship:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo học bổng',
      error: error.message 
    });
  }
});

// PUT update scholarship (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Chỉ admin mới có thể cập nhật học bổng' 
      });
    }

    const { name, content, expiryDate } = req.body;

    const scholarship = await Scholarship.findByIdAndUpdate(
      req.params.id,
      { name, content, expiryDate, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!scholarship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy học bổng' 
      });
    }

    res.json({ 
      success: true, 
      data: scholarship,
      message: 'Đã cập nhật học bổng thành công' 
    });
  } catch (error) {
    console.error('Error updating scholarship:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi cập nhật học bổng',
      error: error.message 
    });
  }
});

// DELETE scholarship (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Kiểm tra quyền admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Chỉ admin mới có thể xóa học bổng' 
      });
    }

    const scholarship = await Scholarship.findByIdAndDelete(req.params.id);

    if (!scholarship) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy học bổng' 
      });
    }

    res.json({ 
      success: true, 
      message: 'Đã xóa học bổng thành công',
      data: scholarship 
    });
  } catch (error) {
    console.error('Error deleting scholarship:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi xóa học bổng',
      error: error.message 
    });
  }
});

// GET scholarships by expiry status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params; // 'active' hoặc 'expired'
    const today = new Date().toISOString().split('T')[0];

    let query = {};
    if (status === 'active') {
      query = { expiryDate: { $gte: today } };
    } else if (status === 'expired') {
      query = { expiryDate: { $lt: today } };
    }

    const scholarships = await Scholarship.find(query).sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      data: scholarships,
      count: scholarships.length 
    });
  } catch (error) {
    console.error('Error fetching scholarships by status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi lấy danh sách học bổng theo trạng thái',
      error: error.message 
    });
  }
});

module.exports = router;
