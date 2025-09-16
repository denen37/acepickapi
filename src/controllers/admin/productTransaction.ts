import { ProductTransaction } from "../../models/Models";
import { errorResponse } from "../../utils/modules";

export const getProductTransactions = async (req: Request, res: Response) => {
    try {
        const productTransactions = await ProductTransaction.findAll({
            
        })
    } catch (error) {
        console.log(error);
        return errorResponse(res, 'error', 'Internal Server Error')
    }
}