import { Container } from "inversify";
import { domainModules } from "./domainModules";
import { thirdPartyModules } from "./thirdPartyModules";

const iocContainer = new Container();
iocContainer.load(domainModules, thirdPartyModules);

export { iocContainer };
