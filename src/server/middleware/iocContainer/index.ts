import { Container } from "inversify";
import "reflect-metadata";
import { domainModules } from "./domainModules";
import { thirdPartyModules } from "./thirdPartyModules";

const iocContainer = new Container();
iocContainer.load(domainModules, thirdPartyModules);

export { iocContainer };
