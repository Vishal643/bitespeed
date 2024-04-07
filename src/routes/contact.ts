import { Express } from "express-serve-static-core";
import { Contact } from "../entity/Contact";
import dotenv from "dotenv";

dotenv.config();

export function saveContact(app: Express) {
  app.post("/identify", async function (req, res) {
    const { phoneNumber, email } = req.body;
    try {
      const contact = Contact.create({
        email,
        phoneNumber
      });
      await contact.save();

      res.send({ message: `Contact created successfully` });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).send({ message: "Something went wrong while creating contact!" });
    }
  });
}
