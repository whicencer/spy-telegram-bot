import { BusinessConnectionHandler } from "./business/businessConnection";
import { BusinessImageMessageHandler } from "./business/businessImageMessage";
import { BusinessMessageHandler } from "./business/businessMessage";
import { DeletedBusinessMessageHandler } from "./business/deletedMessage";
import { EditedBusinessMessageHandler } from "./business/editedMessage";
import { IUpdateHandler } from "./handler";

export const updateHandlers: IUpdateHandler[] = [
  new BusinessMessageHandler(),
  new EditedBusinessMessageHandler(),
  new DeletedBusinessMessageHandler(),
  new BusinessConnectionHandler(),
  new BusinessImageMessageHandler()
];