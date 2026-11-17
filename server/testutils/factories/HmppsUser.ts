import { Factory } from "fishery";
import { HmppsUser } from "../../interfaces/hmppsUser";

class  HmppsUserFactory extends Factory<HmppsUser> {
    
}

HmppsUserFactory.define(() => ({
    authSource: 'authSourceValue',
}))

export { HmppsUserFactory }