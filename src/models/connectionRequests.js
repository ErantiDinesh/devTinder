const mongoose = require('mongoose');

const connectoinRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: {
            values: ['ignore', 'intrested', 'accepted', 'rejected'],
             message: `{value} is not a valid status`
        },
        required: true,
    },
},
{
    timestamps: true,
}
);


connectoinRequestSchema.index({ fromUserId: 1, toUserId: 1 }); //compound indexing for faster queries.  here 1 is asc, -1 is desc
                                                                // we are doing this because we will be searching for 
                                                                // connection requests based on fromUserId and toUserId.

connectoinRequestSchema.pre('save', function (next) {
    if (this.fromUserId.equals(this.toUserId)) {
        throw new Error("fromUserId and toUserId cannot be the same");
    }
    next();
})

const connectionRequest = mongoose.model('connectionRequest', connectoinRequestSchema);

module.exports = connectionRequest;