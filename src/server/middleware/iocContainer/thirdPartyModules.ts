import { ContainerModule, decorate, injectable, interfaces } from "inversify";
import { Controller } from "tsoa";

decorate(injectable(), Controller);

export const thirdPartyModules = new ContainerModule((bind: interfaces.Bind) => {
    // Third-party bindings
});
