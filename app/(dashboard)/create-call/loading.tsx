import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateCallLoading() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
              <Skeleton className="h-6 w-[120px] mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          ))}
          <Skeleton className="h-10 w-full" />
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Skeleton className="h-10 w-[100px]" />
          <Skeleton className="h-10 w-[100px]" />
        </CardFooter>
      </Card>
    </div>
  )
}
