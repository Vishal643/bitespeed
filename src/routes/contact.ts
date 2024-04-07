import { Express } from "express-serve-static-core";
import { Contact } from "../entity/Contact";
import dotenv from "dotenv";

dotenv.config();

export function saveContact(app: Express) {
  app.post("/identify", async function (req, res) {
    const { phoneNumber, email } = req.body;

    try {
      // find all the contacts with the given email or phone number sorted by created date
      const contacts = await Contact.find({
        where: [{ email }, { phoneNumber }],
        order: {
          createdAt: "ASC"
        }
      });

      if (contacts.length > 0) {
        const matchingEmail = contacts.find(contact => contact.email === email);
        const matchingPhoneNumber = contacts.find(contact => contact.phoneNumber === phoneNumber);

        if (matchingEmail || matchingPhoneNumber) {
          // if the email is already present,
          // create new contact with the phone number and email and marks it as secondary and link to the primary contact
          if (matchingEmail && !matchingPhoneNumber) {
            let contact = matchingEmail;
            let secondaryContactId = null;
            if (phoneNumber !== null) {
              contact = Contact.create({
                email,
                phoneNumber
              });
              const linkedId = matchingEmail.linkedId ? matchingEmail.linkedId : matchingEmail.id;
              contact.linkedId = linkedId;
              contact.linkPrecedence = "SECONDARY";
              await contact.save();
              secondaryContactId = contact.id;
            }

            const contacts = await Contact.find({
              where: [{ id: matchingEmail.linkedId }, { linkedId: matchingEmail.linkedId }],
              order: {
                createdAt: "ASC"
              }
            });

            const secondaryContacts = contacts.filter(contact => contact.linkPrecedence === "SECONDARY");

            const phoneNumbers = contacts.map(contact => contact.phoneNumber);
            const emails = contacts.map(contact => contact.email);
            const secondaryContactIds = secondaryContactId
              ? [secondaryContactId, ...secondaryContacts?.map(contact => contact.id)]
              : secondaryContacts?.map(contact => contact.id);

            const payload = {
              primaryContatctId: matchingEmail.id,
              emails: emails.filter((email, index, self) => self.indexOf(email) === index),
              phoneNumbers: phoneNumbers.filter((phone, index, self) => self.indexOf(phone) === index),
              secondaryContactIds: secondaryContactIds
            };
            res.send({ message: `Contact created successfully`, contact: payload });
          }

          // if the phone is already present, create new contact with the phone number and email and marks as secondary and linked to the primary contact
          if (!matchingEmail && matchingPhoneNumber) {
            let contact = matchingPhoneNumber;
            let secondaryContactId = null;
            if (email !== null) {
              contact = Contact.create({
                email,
                phoneNumber
              });
              const linkedId = matchingPhoneNumber.linkedId ? matchingPhoneNumber.linkedId : matchingPhoneNumber.id;
              contact.linkedId = linkedId;
              contact.linkPrecedence = "SECONDARY";
              await contact.save();
            }

            const contacts = await Contact.find({
              where: [{ id: matchingPhoneNumber.linkedId }, { linkedId: matchingPhoneNumber.linkedId }],
              order: {
                createdAt: "ASC"
              }
            });

            const secondaryContacts = contacts.filter(contact => contact.linkPrecedence === "SECONDARY");

            const phoneNumbers = contacts.map(contact => contact.phoneNumber);
            const emails = contacts.map(contact => contact.email);
            const secondaryContactIds = secondaryContactId
              ? [secondaryContactId, ...secondaryContacts?.map(contact => contact.id)]
              : secondaryContacts?.map(contact => contact.id);

            const payload = {
              primaryContatctId: matchingPhoneNumber.id,
              emails: emails.filter((email, index, self) => self.indexOf(email) === index),
              phoneNumbers: phoneNumbers.filter((phone, index, self) => self.indexOf(phone) === index),
              secondaryContactIds: secondaryContactIds
            };

            res.send({ message: `Contact created successfully`, contact: payload });
          }

          if (matchingPhoneNumber && matchingEmail) {
            // get the oldest contact among the two mark the latest one as secondary and linked to the oldest one
            const primaryContact =
              matchingEmail.createdAt < matchingPhoneNumber.createdAt ? matchingEmail : matchingPhoneNumber;
            const secondaryContact =
              matchingEmail.createdAt < matchingPhoneNumber.createdAt ? matchingPhoneNumber : matchingEmail;

            // mark the secondary contact as secondary and linked to the primary contact
            let secondaryContactUpdatedId = 0;
            if (matchingPhoneNumber.id !== matchingEmail.id) {
              Contact.update(secondaryContact.id, {
                linkedId: primaryContact.id,
                linkPrecedence: "SECONDARY"
              });
              secondaryContactUpdatedId = secondaryContact.id;
            }

            let contacts: any[] = [];
            if (primaryContact.linkPrecedence === "PRIMARY" && secondaryContact.linkPrecedence === "PRIMARY") {
              contacts = await Contact.find({
                where: [{ id: primaryContact.id }, { id: secondaryContact.id }],
                order: {
                  createdAt: "ASC"
                }
              });
            } else {
              contacts = await Contact.find({
                where: [{ id: primaryContact.id }, { linkedId: primaryContact.id }, { id: secondaryContactUpdatedId }],
                order: {
                  createdAt: "ASC"
                }
              });
            }

            const isBothPrimary = contacts.every(contact => contact.linkPrecedence === "PRIMARY");
            const secondaryContacts = isBothPrimary
              ? contacts.filter(contact => contact.id !== primaryContact.id)
              : contacts.filter(contact => contact.linkPrecedence === "SECONDARY");

            const phoneNumbers = contacts
              .map(contact => contact.phoneNumber)
              .filter((phone, index, self) => self.indexOf(phone) === index);
            const emails = contacts
              .map(contact => contact.email)
              .filter((email, index, self) => self.indexOf(email) === index);
            const secondaryContactIds = secondaryContacts?.map(contact => contact.id);

            const payload = {
              primaryContatctId: primaryContact.id,
              emails: emails,
              phoneNumbers: phoneNumbers,
              secondaryContactIds: secondaryContactIds
            };

            res.send({ message: `Contact found successfully`, contact: payload });
          }
        }
      } else {
        const contact = Contact.create({
          email,
          phoneNumber
        });
        await contact.save();

        const payload = {
          primaryContatctId: contact.id,
          emails: [contact.email],
          phoneNumbers: [contact.phoneNumber],
          secondaryContactIds: []
        };

        res.send({ message: `Contact created successfully`, contact: payload });
      }
    } catch (err) {
      console.log("Error:", err);
      res.status(500).send({ message: "Something went wrong while creating contact!" });
    }
  });
}
