import express, { Request, Response } from "express";
const app = express();
import db from "@repo/db/client"

app.post('/webhook', async (req: Request, res: Response) => {
    const paymentImformation = {
        // add zod 
        // check if request is actually coming from hdfc , use a webhokk secret here 
        token: req.body.token,
        userId: req.body.user_identifier,
        amount: req.body.amount
    };
    try {
        await db.$transaction([
            db.balance.update({
                where: {
                    userId: Number(paymentImformation.userId)
                },
                data: {
                    amount: {
                        increment: Number(paymentImformation.amount)
                    }
                }
            }),
            db.onRampTransaction.update({
                where: {
                    token: paymentImformation.token
                },
                data: {
                    status: "Success"
                }
            });


        res.status(200).json({
            message: "captured"
        })
        ])
        } catch (err) {
    res.status(411).json({
        message: "Transaction failed!!"
    })
}

})

app.listen(3000, () => {
    console.log('Web hook is running at port 3000');
})

