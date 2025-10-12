// import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// const corsHeaders = {
//   'Access-Control-Allow-Origin': '*',
//   'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
// }


// const KEKA_PROJECTS_URL = 'https://foxsense.keka.com/api/v1/psa/projects'
// // If provided, use this direct token. Otherwise we will mint a new one via OAuth.
// const KEKA_DIRECT_BEARER = ''
// // OAuth settings for minting new access tokens
// const KEKA_OAUTH_URL = 'https://login.keka.com/connect/token'
// const KEKA_CLIENT_ID = '12a5a34f-c553-4d7e-b7f0-13e5677ab0ea'
// const KEKA_CLIENT_SECRET = 'S5eLxQAPijBmhrcCrWyi'
// const KEKA_API_KEY = 'pFDPrsD8-exMZi0NBaP6R5YMLS3i9vytvR0G89aYoM4='
// // Optional scope if your tenant needs it
// const KEKA_SCOPE = 'kekaapi'

// let cachedToken: { token: string; expiresAt: number } | null = null

// async function getAccessToken(): Promise<string> {
//   if (KEKA_DIRECT_BEARER && KEKA_DIRECT_BEARER.length > 0) {
//     return KEKA_DIRECT_BEARER
//   }
//   const now = Date.now()
//   if (cachedToken && cachedToken.expiresAt > now + 30_000) {
//     return cachedToken.token
//   }
//   const body = new URLSearchParams()
//   body.set('grant_type', 'client_credentials')
//   body.set('client_id', KEKA_CLIENT_ID)
//   body.set('client_secret', KEKA_CLIENT_SECRET)
//   body.set('api_key', KEKA_API_KEY)
//   if (KEKA_SCOPE) body.set('scope', KEKA_SCOPE)

//   const res = await fetch(KEKA_OAUTH_URL, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
//     body
//   })
//   if (!res.ok) {
//     const msg = await res.text()
//     throw new Error(`OAuth token fetch failed: ${res.status} ${msg}`)
//   }
//   const json = await res.json() as { access_token: string; expires_in?: number }
//   const token = json.access_token
//   const ttlMs = (json.expires_in ?? 3600) * 1000
//   cachedToken = { token, expiresAt: Date.now() + ttlMs - 60_000 }
//   return token
// }

// interface KekaProject {
//   id: string;
//   name: string;
//   description?: string;
//   status: string;
//   startDate?: string;
//   endDate?: string;
//   budget?: number;
//   manager?: {
//     id: string;
//     name: string;
//     email: string;
//   };
//   progress?: number;
//   department?: string;
// }

// serve(async (req) => {
//   // Handle CORS preflight requests
//   if (req.method === 'OPTIONS') {
//     return new Response('ok', { headers: corsHeaders })
//   }

//   try {
//     // Support pagination passthrough
//     const url = new URL(KEKA_PROJECTS_URL)
//     const { searchParams } = new URL(req.url)
//     const pageNumber = searchParams.get('pageNumber')
//     const pageSize = searchParams.get('pageSize')
//     if (pageNumber) url.searchParams.set('pageNumber', pageNumber)
//     if (pageSize) url.searchParams.set('pageSize', pageSize)

//     const bearer = await getAccessToken()
//     const projectsResponse = await fetch(url.toString(), {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${bearer}`,
//         'Accept': 'application/json'
//       }
//     })

//     if (!projectsResponse.ok) {
//       const errTxt = await projectsResponse.text()
//       console.error('Projects fetch failed:', errTxt)
//       return new Response(
//         JSON.stringify({ error: `Failed to fetch projects: ${projectsResponse.status}`, details: errTxt }),
//         { 
//           status: 500, 
//           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
//         }
//       )
//     }

//     const projectsData = await projectsResponse.json()
//     // Keka response has shape { data: [...], ... } or just { data: [...], meta... }
//     const items = Array.isArray(projectsData) ? projectsData : (projectsData.data ?? [])

//     // Transform the data to match our interface
//     const transformedProjects: KekaProject[] = items.map((project: any) => ({
//       id: project.id || project.projectId,
//       name: project.name || project.projectName,
//       description: project.description,
//       status: mapKekaStatus(project.status),
//       startDate: project.startDate || project.startedOn,
//       endDate: project.endDate || project.expectedEndDate,
//       budget: project.budget || project.budgetAmount,
//       manager: project.manager || project.projectManager ? {
//         id: project.manager?.id || project.projectManager?.id,
//         name: project.manager?.name || project.projectManager?.name,
//         email: project.manager?.email || project.projectManager?.email
//       } : undefined,
//       progress: project.progress || project.completionPercentage || 0,
//       department: project.department || project.businessUnit
//     }))

//     return new Response(
//       JSON.stringify(transformedProjects),
//       { 
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
//       }
//     )

//   } catch (error) {
//     console.error('Error in keka-projects function:', error)
//     return new Response(
//       JSON.stringify({ error: 'Internal server error' }),
//       { 
//         status: 500, 
//         headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
//       }
//     )
//   }
// })

// function mapKekaStatus(kekaStatus: string): string {
//   const statusMap: Record<string, string> = {
//     'ACTIVE': 'active',
//     'COMPLETED': 'completed',
//     'ON_HOLD': 'on-hold',
//     'CANCELLED': 'cancelled',
//     'PLANNED': 'not-started',
//     'DRAFT': 'not-started'
//   }
  
//   return statusMap[kekaStatus?.toUpperCase()] || 'not-started'
// }