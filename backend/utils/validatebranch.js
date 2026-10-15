const Branch = require('../models/Branch');

const validateBranch = async (branchId, campusId) => {
    if (!branchId || branchId === 'null' || branchId === '') {
        return { isValid: true, message: 'Branch not provided' };
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
        return { isValid: false, message: 'Branch not found' };
    }

    if (campusId && branch.campus && branch.campus.toString() !== campusId.toString()) {
        return { isValid: false, message: 'Branch does not belong to the specified campus' };
    }

    return { isValid: true, message: 'Branch is valid' };
};

module.exports = validateBranch;