import { HTTPCodes, MethodCallArgs, WebDAVRequest } from '../WebDAVRequest'
import { IResource, ResourceType } from '../../resource/Resource'
import { FSPath } from '../../manager/FSManager'

export default function(arg : MethodCallArgs, callback)
{
    arg.getResource((e, r) => {
        if(e)
        {
            arg.setCode(HTTPCodes.NotFound)
            callback();
            return;
        }

        const override = arg.findHeader('overwrite') === 'T';

        let destination : any = arg.findHeader('destination');
        if(!destination)
        {
            arg.setCode(HTTPCodes.BadRequest);
            callback();
            return;
        }
        
        destination = destination.substring(destination.indexOf('://') + '://'.length)
        destination = destination.substring(destination.indexOf('/'))
        destination = new FSPath(destination)

        arg.server.getResourceFromPath(destination.getParent(), (e, rDest) => {
            r.moveTo(rDest, destination.fileName(), override, (e) => {
                if(e)
                    arg.setCode(HTTPCodes.InternalServerError)
                else
                    arg.setCode(HTTPCodes.Created)
                callback()
            })
        })
    })
}