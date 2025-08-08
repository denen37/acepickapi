"use strict";
async;
acceptDelivery(req, Request, res, Response);
{
    const riderId = req.user.id;
    const { deliveryId } = req.params;
    const t = await db.transaction();
    try {
        const delivery = await Delivery.findOne({
            where: {
                id: deliveryId,
                rider_id: null,
                delivery_status: 'pending',
                is_delivered: false,
                provider: 'alabaster',
            },
            lock: t.LOCK.UPDATE,
            transaction: t,
        });
        if (!delivery) {
            await t.rollback();
            return res.status(404).json(responseData(false, 404, 'This delivery has already been accepted or is no longer available.'));
        }
        const rider = await User.findByPk(riderId, { include: [Vendor] });
        if (!rider || !rider.vendor) {
            await t.rollback();
            return res.status(404).json(responseData(false, 404, 'Rider details not found.'));
        }
        const vendor = rider.vendor;
        await delivery.update({
            rider_id: riderId,
            delivery_status: 'awaitingPickup',
            is_delivered: false,
            company_code: vendor.company_code,
            rider_name: vendor.business_name,
            rider_contact: vendor.phone,
        }, { transaction: t });
        await this.updateWallet(delivery.order_no, delivery.vendor_id, delivery.fare, true);
        await rider.notify(new SmsNotifier(rider, `Dear ${rider.first_name}, Your shipment code to present at pickup: ${delivery.shipping_number}`));
        await t.commit();
        return res.json(responseData(true, 200, 'Delivery accepted successfully.', {
            values: {
                shipping_number: delivery.shipping_number,
                delivery: delivery,
            },
        }));
    }
    catch (error) {
        await t.rollback();
        console.error("Unexpected error while accepting delivery", {
            order_no: deliveryId,
            error: error.message,
            line: error.lineNumber,
            file: error.fileName,
        });
        return res.status(500).json(responseData(false, 500, error.message));
    }
}
async;
updateWallet(orderNo, string, vendorId, number, fare, number, isCredit, boolean);
{
    // Implement wallet update logic here
    return {};
}
async;
rejectDelivery(req, Request, res, Response);
{
    const riderId = req.user.id;
    const { deliveryId } = req.params;
    console.info(`Rider ${riderId} rejected delivery ${deliveryId}`);
    return res.json(responseData(true, 200, 'Delivery rejected. It will no longer appear.'));
}
async;
getPendingOffersForRider(req, Request, res, Response);
{
    const riderId = req.user.id;
    const rider = await User.findByPk(riderId, {
        include: [{ association: 'location', order: [['created_at', 'DESC']] }]
    });
    const location = await (rider === null || rider === void 0 ? void 0 : rider.getLocation({ order: [['created_at', 'DESC']] }));
    if (!location) {
        return res.status(404).json(responseData(true, 404, 'Rider location not found.', {
            values: { data: [] }
        }));
    }
    const lat = parseFloat(location.map_lat);
    const lng = parseFloat(location.map_long);
    const distanceSql = `(
      6371 * acos(
        cos(radians(${lat})) *
        cos(radians(pickup_lat)) *
        cos(radians(pickup_lng) - radians(${lng})) +
        sin(radians(${lat})) *
        sin(radians(pickup_lat))
      )
    )`;
    const deliveries = await Delivery.findAll({
        attributes: {
            include: [[db.literal(distanceSql), 'distance_to_pickup']]
        },
        where: {
            rider_id: null,
            delivery_status: 'pending',
            is_delivered: false,
            provider: 'alabaster'
        },
        having: db.literal('distance_to_pickup <= 50'),
        order: db.literal('distance_to_pickup ASC')
    });
    if (deliveries.length === 0) {
        return res.status(404).json(responseData(false, 404, 'No nearby pending deliveries found.'));
    }
    return res.json(responseData(true, 200, 'Pending delivery list generated.', {
        values: deliveries
    }));
}
