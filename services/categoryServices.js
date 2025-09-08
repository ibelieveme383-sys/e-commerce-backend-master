const categorySchema = require('../models/categoryModel')
const slugify = require('slugify')

exports.createCategory = async (req, res) => {
    try {
        const category = await categorySchema.create({
            name: req.body.name, slug: slugify(req.body.name), image: req.savedImage 
        
        })

        res.status(201).json({ status: 'success', data: category })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}
exports.catget_all = async (req, res) => {
    try {
        const page = req.query.page*1||1
        const limit = req.query.limit * 1 || 100
        const skip=(page-1)*limit
           // احصل على العدد الإجمالي للعناصر
    const totalItems = await categorySchema.countDocuments();
    
    // حساب إجمالي عدد الصفحات
    const totalPages = Math.ceil(totalItems / limit);
        const category = await categorySchema.find().skip(skip).limit(limit)
        // const category = await categorySchema.find() 

        res.status(200).json({    PaginationCategory: {
            CurrentPage: page,
            totalPages: totalPages,
            limit: limit,
            totalItems: totalItems
        },count: category.length ,status: 'success', Data: category
            
         })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}
exports.get_one_catget = async (req, res) => {
    try {

        const category = await categorySchema.findById(req.params.Id)

        res.status(200).json({ count: category.length ,status: 'success', Data: category })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}
exports.update_catget = async (req, res) => {
    try {

        const category = await categorySchema.findByIdAndUpdate(req.params.Id,req.body,{ new: true, runValidators: true })

        res.status(200).json({ count: category.length ,status: 'success', Data: category })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}

exports.delete = async (req, res) => {
    try {

        const category = await categorySchema.findByIdAndDelete(req.params.Id)

        res.status(200).json({ status: 'success' })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}

